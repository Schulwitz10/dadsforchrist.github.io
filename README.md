# Dads for Christ

Static website for [dadsforchrist.org](https://www.dadsforchrist.org), a Michigan nonprofit encouraging fathers to lead their families in faith. It is plain HTML, CSS, and JavaScript so it can keep deploying on GitHub Pages with no build step.

The custom domain is set in `CNAME` (`www.dadsforchrist.org`). Leave that file in place.

## Preview locally

From this folder:

```bash
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`. The store, donate page, and blog list load JSON files, so they need a local server (opening the HTML files directly will not load those lists).

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

Daily posts live in the `blog/` folder. The list on `blog.html` and the three latest posts on the home page are read from `posts.json`. The feed is `feed.xml`.

## Publish a daily post

Do these steps in order. There is no build step. After you push, GitHub Pages publishes the new file.

1. Copy `blog/_TEMPLATE.html` to a new file named `blog/YYYY-MM-DD-slug.html`. Use the date you are publishing and a short slug, for example `blog/2026-10-30-lead-with-prayer.html`.
2. Open the new file and replace every `TITLE_HERE`, `DATE_ISO`, `DATE_LABEL`, `EXCERPT_HERE`, and `SLUG_HERE` token, including the canonical URL, the share links, and `data-url`. Write the post in the article body. Keep the closing box that links to the mission, the Reach One bracelet, and donate.
3. Add an entry at the **top** of the `posts` array in `posts.json` (newest first):

```json
{
  "date": "2026-10-30",
  "dateLabel": "",
  "title": "Lead with Prayer",
  "slug": "lead-with-prayer",
  "url": "blog/2026-10-30-lead-with-prayer.html",
  "excerpt": "One or two sentences for the blog list and the home page.",
  "image": "img/blog.webp",
  "imageAlt": "Describe the picture."
}
```

Leave `image` as `""` if the post has no picture. `dateLabel` is optional. If you leave it blank, the list formats `date`. Previous and next links on each post are filled from this file, so you do not edit them by hand.

4. Add a new `<item>` at the **top** of `feed.xml`, inside `<channel>`, with the title, the full `https://www.dadsforchrist.org/blog/...` link, the same link as `<guid>`, an RFC-822 `<pubDate>`, and the excerpt inside `<description>`.
5. Commit and push to the branch GitHub Pages serves (usually `main`).

The home page shows the three newest entries from `posts.json`. `blog.html` shows the full list and replaces the old “Coming soon” cards.

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

Giving links live in **`donations.json`**. Every control on the donate page is a live Stripe link. Checkout returns the donor to `/thanks.html`. Card numbers are entered on Stripe, not on this site.

| Field | What it does now |
| --- | --- |
| `oneTimeUrl` | Open one-time gift. The donor chooses the amount. Stripe presets $25 and accepts a minimum of $1. The button label is `oneTimeLabel` (“Give any amount”). |
| `amounts` | Fixed one-time gifts: $10, $25, $50, $100, and $250. Each object has `label`, `dollars`, and its own `url`. |
| `monthly` | Recurring monthly tiers: $10, $25, $50, and $100. Same shape as `amounts`. |

Current links:

| Gift | URL |
| --- | --- |
| Any amount (one-time) | `https://donate.stripe.com/14A28qcJue9zgKHf7n7Vm02` |
| $10 one-time | `https://donate.stripe.com/6oU9AS8te5D3fGD8IZ7Vm03` |
| $25 one-time | `https://donate.stripe.com/3cI5kC9xi0iJamj5wN7Vm04` |
| $50 one-time | `https://donate.stripe.com/dRm4gygZKd5veCze3j7Vm05` |
| $100 one-time | `https://donate.stripe.com/dRmeVc4cY5D33XV6AR7Vm06` |
| $250 one-time | `https://donate.stripe.com/8x27sKdNyfdDeCzf7n7Vm07` |
| $10/month | `https://buy.stripe.com/14A4gyfVGfdD1PNcZf7Vm08` |
| $25/month | `https://buy.stripe.com/4gM6oGbFqfdDdyv2kB7Vm09` |
| $50/month | `https://buy.stripe.com/3cIdR86l66H72TR0ct7Vm0a` |
| $100/month | `https://buy.stripe.com/9B63cu9xi5D3fGDgbr7Vm0b` |

Stripe charges the price saved on that link. Keep a separate URL for each amount. To change a gift, paste the new `https://` link into the matching field and push. An empty `url` turns that button back into a disabled control so it cannot pretend to take a payment. Home-page Donate buttons go to `donate.html`; they do not have their own checkout URLs.

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
