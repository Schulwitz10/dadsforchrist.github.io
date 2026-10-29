# Dads for Christ

Static website for [dadsforchrist.org](https://www.dadsforchrist.org), a Michigan nonprofit encouraging fathers to lead their families in faith. It is plain HTML, CSS, and JavaScript so it can keep deploying on GitHub Pages with no build step.

The custom domain is set in `CNAME` (`www.dadsforchrist.org`). Leave that file in place.

## Preview locally

From this folder:

```bash
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`. The store and donate pages load `products.json` and `donations.json`, so they need a local server (opening the HTML files directly will not load those lists).

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Mission | `mission.html` |
| Blog | `blog.html` |
| Store | `store.html` |
| Donate | `donate.html` |
| Podcast | `podcast.html` |
| Free Bible | `bible.html` |
| I Said Yes | `isaidyes.html` |
| Contact | `contact.html` |
| Thank you | `thanks.html` |

Navigation and the footer are repeated on each page. If you add a page, add a link in both places on every file, and in `style.css` you do not need a new rule.

## Edit the store

The product grid is built from **`products.json`** only. Edit that file, commit, and push. GitHub Pages will publish the new list. You do not need to touch `store.html` to add a shirt, hat, or another bracelet.

Each item lives in the `products` array:

| Field | What to put |
| --- | --- |
| `id` | Short unique slug, such as `reach-one-hat` |
| `name` | Name shown on the card |
| `price` | Text such as `$25.00`. Use `Price not set` until you know it |
| `status` | `available` when it can be bought. `placeholder` when it cannot |
| `featured` | `true` on the one item that should span the top of the grid |
| `image` | Path to a WebP, SVG, or other image, such as `img/reach-one.webp` |
| `imageFallback` | Original PNG (or the same SVG). Spaces in filenames must be written as `%20` |
| `alt` | What the picture shows, for screen readers |
| `summary` | Short description |
| `details` | A list of short lines |
| `checkoutUrl` | Full `https://` checkout link, or `""` if you do not have one yet |
| `checkoutLabel` | Button text, such as `Buy now — $10.00` |
| `note` | Small print under the button |

The Reach One bracelet already has a live Stripe Payment Link:

`https://buy.stripe.com/cNi3cu24Qe9zfGD1gx7Vm01`

That link charges $10.00 for the bracelet. Stripe adds shipping on the checkout page (currently $2.99).

The shirt and hat are **placeholders**. Their buttons stay disabled and say “Checkout not connected” until you add a real URL and set `status` to `available`.

### Plug in a real checkout link

Any hosted checkout URL works. Stripe Payment Links are the simplest fit for GitHub Pages, because the customer pays on Stripe and this site never handles a card.

1. In the [Stripe Dashboard](https://dashboard.stripe.com/payment-links), create a product (for example “Reach One T-Shirt”) with the price you will charge.
2. Create a Payment Link for that product and copy the `https://buy.stripe.com/...` URL.
3. In `products.json`, paste that URL into `checkoutUrl`.
4. Set `status` to `available`, set `price` and `checkoutLabel`, and replace the placeholder image if you have a photo.
5. Commit and push to the branch GitHub Pages publishes (usually `main`).

A Shopify checkout URL, a print-on-demand product link (Printful, Spring, and similar), or any other `https://` payment page can go in `checkoutUrl` the same way. The button opens that page in a new tab. Empty URLs, and URLs that still contain `YOUR_` or `PLACEHOLDER`, are treated as not connected.

To add another product, copy one object in the `products` array, give it a new `id`, and repeat the steps above.

## Edit donations

Giving links live in **`donations.json`**. The old donate page used `https://buy.stripe.com/YOUR_ONETIME_LINK` and `https://buy.stripe.com/YOUR_MONTHLY_LINK`. Those were not real checkouts, so this page does not send people there. Until you paste working URLs, the amounts and buttons are labeled **placeholder** and cannot be clicked.

| Field | What to put |
| --- | --- |
| `oneTimeUrl` | A Payment Link for a one-time gift, or `""` |
| `monthlyUrl` | A **recurring** Payment Link for monthly partnership, or `""` |
| `amounts` | Suggested gifts. Each object has `label`, `dollars`, and its own `url` |

Stripe charges the price saved on the Payment Link, not the words on the button. Create a separate Payment Link for $10, $25, $50, $100, and $250 if you want those chips to check out at those amounts. Do not point every amount at one link.

### Connect Stripe

1. In Stripe, create a one-time price for each suggested amount and copy each Payment Link into that amount’s `url`.
2. Create a recurring monthly price and paste that Payment Link into `monthlyUrl`.
3. If you also want one general one-time button (a single amount, or a Stripe link you choose), paste it into `oneTimeUrl`.
4. Commit and push.

After a URL is saved, that control becomes a real link and opens Stripe. Gray buttons are still placeholders. Card numbers are entered on Stripe, not on this site.

Shopify or another hosted giving page works the same way: paste the `https://` URL into the field you want.

When 501(c)(3) approval is finished, update the tax sentence in the footer of each page, the FAQ on `donate.html`, and the stewardship note on `mission.html`. Until then the site says gifts are not tax-deductible.

## Images

Original PNGs stay in the project root (`Banner.png`, `Blog.png`, `cover.png`, `mission.png`, `Reach One.png`, `Store.png`). Smaller WebP copies used by the pages are in `img/`. If you replace a photo, export a WebP into `img/` and keep the PNG so older links and the fallback still work.

## Forms

These Formspree forms were already on the site and are unchanged except for layout and a thank-you redirect:

- Contact: `https://formspree.io/f/xzdqlroz`
- Bible request: `https://formspree.io/f/xzzalpyl`
- I Said Yes: `https://formspree.io/f/mdklrnwp`

Ministry email: `dadsforchrist@gmail.com`.

Podcast: [YouTube](https://www.youtube.com/@dadsforchrist42) and [Spotify](https://open.spotify.com/show/3HJFIRYgdZORSfpfOyoy1w?si=018067ceb8e44621).
