(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var label = document.querySelector(".nav-toggle-label");

  function setOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (label) label.textContent = open ? "Close" : "Menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  if (document.getElementById("product-grid")) renderStore();
  if (document.getElementById("donate-app")) renderDonate();

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function isLiveUrl(url) {
    if (!url || typeof url !== "string") return false;
    var trimmed = url.trim();
    if (!/^https:\/\/[^\s]+$/i.test(trimmed)) return false;
    if (/YOUR_|PLACEHOLDER|example\.com|xxx/i.test(trimmed)) return false;
    return true;
  }

  function renderStore() {
    var grid = document.getElementById("product-grid");
    var status = document.getElementById("store-status");
    fetch("products.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load products");
        return response.json();
      })
      .then(function (data) {
        var products = (data && data.products) || [];
        products.sort(function (a, b) {
          return (b.featured === true) - (a.featured === true);
        });
        var placeholders = products.filter(function (product) {
          return !(product.status === "available" && isLiveUrl(product.checkoutUrl));
        }).length;
        if (!products.length) {
          status.textContent = "No products are listed yet. Add them in products.json.";
        } else if (placeholders) {
          status.textContent = "Listings marked Placeholder are not for sale yet. Available items open a secure hosted checkout.";
        } else {
          status.textContent = "Every item below opens a secure hosted checkout.";
        }
        grid.innerHTML = products.map(productCard).join("");
      })
      .catch(function () {
        status.textContent = "The product list could not be loaded. The Reach One bracelet can still be purchased below.";
        grid.innerHTML = fallbackBracelet();
      });
  }

  function productCard(product) {
    var live = product.status === "available" && isLiveUrl(product.checkoutUrl);
    var id = escapeHtml(product.id || "product");
    var image = escapeHtml(product.image || "");
    var fallback = escapeHtml(product.imageFallback || product.image || "");
    var sourceType = /\.svg($|\?)/i.test(product.image || "") ? "image/svg+xml" : "image/webp";
    var contain = /\.svg($|\?)/i.test(product.image || "") ? " is-contain" : "";
    var details = (product.details || [])
      .map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; })
      .join("");
    var action = live
      ? '<a class="btn btn-gold" href="' + escapeHtml(product.checkoutUrl.trim()) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(product.checkoutLabel || "Buy now") + "</a>"
      : '<button class="btn btn-placeholder" type="button" disabled aria-describedby="' + id + '-note">Checkout not connected</button>';
    var badge = live
      ? '<span class="badge badge-live">Available</span>'
      : '<span class="badge badge-placeholder">Placeholder</span>';

    return (
      '<article class="product-card' + (product.featured ? " featured" : "") + '">' +
        '<div class="product-media' + contain + '">' +
          "<picture>" +
            '<source srcset="' + image + '" type="' + sourceType + '">' +
            '<img src="' + fallback + '" alt="' + escapeHtml(product.alt || product.name || "Product") + '" width="1200" height="800" loading="lazy">' +
          "</picture>" +
        "</div>" +
        '<div class="product-body">' +
          badge +
          "<h3>" + escapeHtml(product.name || "Product") + "</h3>" +
          '<p class="price">' + escapeHtml(product.price || "") + "</p>" +
          "<p>" + escapeHtml(product.summary || "") + "</p>" +
          (details ? '<ul class="clean-list">' + details + "</ul>" : "") +
          action +
          '<p class="note" id="' + id + '-note">' + escapeHtml(product.note || "") + "</p>" +
        "</div>" +
      "</article>"
    );
  }

  function fallbackBracelet() {
    return (
      '<article class="product-card featured">' +
        '<div class="product-media">' +
          "<picture>" +
            '<source srcset="img/reach-one.webp" type="image/webp">' +
            '<img src="Reach%20One.png" alt="Black woven Reach One bracelets on a wooden table" width="1400" height="933">' +
          "</picture>" +
        "</div>" +
        '<div class="product-body">' +
          '<span class="badge badge-live">Available</span>' +
          "<h3>Reach One Bracelet</h3>" +
          '<p class="price">$10.00</p>' +
          "<p>The Reach One Bracelet is a daily reminder that every soul matters.</p>" +
          '<a class="btn btn-gold" href="https://buy.stripe.com/cNi3cu24Qe9zfGD1gx7Vm01" target="_blank" rel="noopener noreferrer">Buy now — $10.00</a>' +
        "</div>" +
      "</article>"
    );
  }

  function renderDonate() {
    var callout = document.getElementById("donate-callout");
    var amounts = document.getElementById("donate-amounts");
    var actions = document.getElementById("donate-actions");
    fetch("donations.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load donations");
        return response.json();
      })
      .then(function (data) {
        var amountList = (data && data.amounts) || [];
        var liveAmounts = amountList.filter(function (item) { return isLiveUrl(item.url); }).length;
        var oneTime = isLiveUrl(data.oneTimeUrl);
        var monthly = isLiveUrl(data.monthlyUrl);
        var anyLive = liveAmounts > 0 || oneTime || monthly;

        callout.hidden = false;
        callout.className = "callout";
        if (!anyLive) {
          callout.innerHTML =
            "<h2>Checkout not connected yet</h2>" +
            "<p>These amounts and buttons are <strong>placeholders</strong>. They do not take a payment. To give now, email <a href=\"mailto:dadsforchrist@gmail.com\">dadsforchrist@gmail.com</a>. Whoever updates the site can connect Stripe, or another hosted checkout, in <code>donations.json</code>.</p>";
        } else if (liveAmounts < amountList.length || !oneTime || !monthly) {
          callout.innerHTML =
            "<h2>Some giving links are still placeholders</h2>" +
            "<p>Links open a secure checkout. Gray amounts are not connected yet. Finish them in <code>donations.json</code>.</p>";
        } else {
          callout.hidden = true;
          callout.innerHTML = "";
        }

        amounts.innerHTML = amountList.map(function (item) {
          var label = escapeHtml(item.label || ("$" + item.dollars));
          if (isLiveUrl(item.url)) {
            return '<a class="amount" href="' + escapeHtml(item.url.trim()) + '" target="_blank" rel="noopener noreferrer">Give ' + label + '<span class="sr-only"> — opens secure checkout</span></a>';
          }
          return '<button class="amount" type="button" disabled>' + label + '<span class="sr-only"> placeholder, checkout not connected</span></button>';
        }).join("");

        actions.innerHTML =
          giftButton(oneTime, data.oneTimeUrl, "Give a one-time gift", "btn-brick") +
          giftButton(monthly, data.monthlyUrl, "Become a monthly partner", "btn-ghost");
      })
      .catch(function () {
        callout.innerHTML =
          "<h2>Giving options could not be loaded</h2>" +
          "<p>Email <a href=\"mailto:dadsforchrist@gmail.com\">dadsforchrist@gmail.com</a> and we will help you give. Online buttons are not available until donations.json loads.</p>";
      });
  }

  function giftButton(live, url, label, style) {
    if (live) {
      return '<a class="btn ' + style + '" href="' + escapeHtml(url.trim()) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label) + "</a>";
    }
    return '<button class="btn btn-placeholder" type="button" disabled>' + escapeHtml(label) + " — placeholder</button>";
  }
})();
