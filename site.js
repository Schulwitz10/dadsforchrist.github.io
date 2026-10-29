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
  if (document.getElementById("post-list") || document.getElementById("home-posts") || document.getElementById("post-pager")) {
    renderPosts();
  }

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
    var monthly = document.getElementById("donate-monthly");
    fetch("donations.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load donations");
        return response.json();
      })
      .then(function (data) {
        var amountList = (data && data.amounts) || [];
        var monthlyList = (data && data.monthly) || [];
        var liveAmounts = amountList.filter(function (item) { return isLiveUrl(item.url); }).length;
        var liveMonthly = monthlyList.filter(function (item) { return isLiveUrl(item.url); }).length;
        var oneTime = isLiveUrl(data.oneTimeUrl);
        var legacyMonthly = isLiveUrl(data.monthlyUrl);
        var anyLive = liveAmounts > 0 || liveMonthly > 0 || oneTime || legacyMonthly;
        var amountsComplete = amountList.length > 0 && liveAmounts === amountList.length;
        var monthlyComplete = (monthlyList.length > 0 && liveMonthly === monthlyList.length) || (monthlyList.length === 0 && legacyMonthly);

        if (!anyLive) {
          callout.hidden = false;
          callout.className = "callout";
          callout.innerHTML =
            "<h2>Checkout not connected yet</h2>" +
            "<p>These amounts are not linked to Stripe yet. Email <a href=\"mailto:dadsforchrist@gmail.com\">dadsforchrist@gmail.com</a> to give.</p>";
        } else if (!amountsComplete || !monthlyComplete || !oneTime) {
          callout.hidden = false;
          callout.className = "callout";
          callout.innerHTML =
            "<h2>Some giving links are still missing</h2>" +
            "<p>Linked amounts open Stripe. Gray amounts are not connected yet. Finish them in <code>donations.json</code>.</p>";
        } else {
          callout.hidden = true;
          callout.innerHTML = "";
        }

        amounts.innerHTML = amountList.map(function (item) {
          return amountLink(item, "one-time gift");
        }).join("");

        actions.innerHTML = giftButton(oneTime, data.oneTimeUrl, data.oneTimeLabel || "Give any amount", "btn-brick");

        if (monthly) {
          var monthlyHtml = monthlyList.map(function (item) {
            return amountLink(item, "monthly gift");
          }).join("");
          if (legacyMonthly && !monthlyList.length) {
            monthlyHtml = giftButton(true, data.monthlyUrl, "Become a monthly partner", "btn-ghost");
          }
          monthly.innerHTML = monthlyHtml;
        }
      })
      .catch(function () {
        callout.hidden = false;
        callout.className = "callout";
        callout.innerHTML =
          "<h2>Giving options could not be loaded</h2>" +
          "<p>Email <a href=\"mailto:dadsforchrist@gmail.com\">dadsforchrist@gmail.com</a> and we will help you give. Online buttons are not available until donations.json loads.</p>";
      });
  }

  function amountLink(item, kind) {
    var label = escapeHtml(item.label || ("$" + item.dollars));
    if (isLiveUrl(item.url)) {
      return '<a class="amount" href="' + escapeHtml(item.url.trim()) + '" target="_blank" rel="noopener noreferrer">' + label + '<span class="sr-only"> ' + escapeHtml(kind) + ", opens secure checkout</span></a>";
    }
    return '<button class="amount" type="button" disabled>' + label + '<span class="sr-only"> not connected</span></button>';
  }

  function depthPrefix() {
    return document.body.getAttribute("data-depth") === "blog" ? "../" : "";
  }

  function postHref(url) {
    var path = String(url || "");
    if (document.body.getAttribute("data-depth") === "blog") return path.replace(/^blog\//, "");
    return path;
  }

  function formatDate(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length < 3) return iso || "";
    var date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  function postDate(post) {
    return post.dateLabel || formatDate(post.date);
  }

  function renderPosts() {
    fetch(depthPrefix() + "posts.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load posts");
        return response.json();
      })
      .then(function (data) {
        var posts = ((data && data.posts) || []).slice().sort(function (a, b) {
          if (a.date === b.date) return 0;
          return a.date < b.date ? 1 : -1;
        });
        var list = document.getElementById("post-list");
        var home = document.getElementById("home-posts");
        if (list) {
          list.innerHTML = posts.length
            ? posts.map(postCard).join("")
            : "<p>No posts yet. Add one in posts.json.</p>";
        }
        if (home) {
          var latest = posts.slice(0, 3);
          home.innerHTML = latest.length
            ? latest.map(postCard).join("")
            : "<p>New posts will appear here.</p>";
        }
        renderPostPager(posts);
      })
      .catch(function () {
        var list = document.getElementById("post-list");
        var home = document.getElementById("home-posts");
        if (list) list.innerHTML = "<p>The post list could not be loaded.</p>";
        if (home) home.innerHTML = "<p><a href=\"blog.html\">Read the blog</a></p>";
      });
  }

  function postCard(post) {
    var href = escapeHtml(postHref(post.url));
    var image = "";
    if (post.image) {
      image = '<img src="' + escapeHtml(depthPrefix() + post.image) + '" alt="' + escapeHtml(post.imageAlt || "") + '" width="1200" height="800" loading="lazy">';
    }
    return (
      '<article class="card post-card">' +
        image +
        '<p class="note">' + escapeHtml(postDate(post)) + "</p>" +
        '<h3><a href="' + href + '">' + escapeHtml(post.title || "Post") + "</a></h3>" +
        "<p>" + escapeHtml(post.excerpt || "") + "</p>" +
        '<a class="btn btn-ghost" href="' + href + '">Read</a>' +
      "</article>"
    );
  }

  function renderPostPager(posts) {
    var pager = document.getElementById("post-pager");
    if (!pager) return;
    var current = pager.getAttribute("data-url");
    var index = -1;
    posts.forEach(function (post, i) {
      if (post.url === current) index = i;
    });
    if (index < 0) {
      pager.innerHTML = "";
      return;
    }
    var newer = posts[index - 1];
    var older = posts[index + 1];
    pager.innerHTML =
      "<div>" + pagerLink(older, "Previous") + "</div>" +
      '<div class="next">' + pagerLink(newer, "Next") + "</div>";
  }

  function pagerLink(post, label) {
    if (!post) return "";
    return '<a href="' + escapeHtml(postHref(post.url)) + '"><span class="label">' + label + "</span>" + escapeHtml(post.title) + "</a>";
  }

  function giftButton(live, url, label, style) {
    if (live) {
      return '<a class="btn ' + style + '" href="' + escapeHtml(url.trim()) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label) + "</a>";
    }
    return '<button class="btn btn-placeholder" type="button" disabled>' + escapeHtml(label) + "</button>";
  }
})();
