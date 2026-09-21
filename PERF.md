# Wood Lounge Site Performance Optimization Report (PERF.md)

## Files Supplied / Required

| Asset | Status | Notes |
|---|---|---|
| `assets/logo.png` | **Present & Verified** | 188x200 px, 22.2 KB. Verified transparent alpha channel (36,612 transparent px out of 37,600). `brightness-0 invert` filter inverts artwork cleanly to white. |
| `assets/hero-video.mp4` | **Present & Requires Re-encoding** | 34.57 MB. Encoded in **HEVC/H.265** (`hvc1`), which prevents native playback in Chrome. Will be converted in Step 4 to H.264 (`avc1`) 720p <= 3 MB. |

---

## Before (Step 0 Baseline Inventory)

### Overview of External Dependencies
- **Tailwind CSS**: Dynamically compiled in-browser via `https://cdn.tailwindcss.com` on all 37 pages.
- **Web Fonts**: 14 distinct external Google Fonts stylesheet URLs loaded across pages.
- **Images**: 120 unique remote images hotlinked to `https://lh3.googleusercontent.com/aida-public/...`.
- **Hero Video**: 34.57 MB raw HEVC file with no poster image and no adaptive fallback.
- **Duplicate Elements**: Duplicate showroom section & duplicate `locationsData` script on `index.html`.

### Per-Page Resource Inventory (37 Routes)

| Route / File | Scripts | Stylesheets / Fonts | Remote Images | Media / Iframes |
|---|---|---|---|---|
| `404.html` | tailwindcss-cdn?plugins=forms, /assets/site.js | 3 font/style links | 0 remote imgs | None |
| `admin/custom-requests/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `admin/customers/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 0 remote imgs | None |
| `admin/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `admin/inspections/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 0 remote imgs | None |
| `admin/orders/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 3 remote imgs | None |
| `admin/payments/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 1 remote imgs | None |
| `admin/products/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 10 remote imgs | None |
| `book-visit/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 4 remote imgs | None |
| `cart/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 3 remote imgs | None |
| `checkout/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 3 remote imgs | None |
| `custom-order/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `index.html` | tailwindcss-cdn?plugins=forms,container-queries, /assets/site.js | 5 font/style links | 13 remote imgs | /assets/hero-video.mp4, about:blank, https://maps.google.com/maps?q=160+Ogui+Rd+Enugu+Nigeria&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed |
| `m/admin/custom-requests/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `m/admin/customers/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `m/admin/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 2 remote imgs | None |
| `m/admin/inspections/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 2 remote imgs | None |
| `m/admin/orders/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 2 remote imgs | None |
| `m/admin/payments/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `m/admin/products/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 7 remote imgs | None |
| `m/book-visit/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 1 remote imgs | None |
| `m/cart/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 4 remote imgs | None |
| `m/checkout/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 4 remote imgs | None |
| `m/custom-order/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 4 remote imgs | None |
| `m/index.html` | tailwindcss-cdn?plugins=forms,container-queries, /assets/site.js | 6 font/style links | 14 remote imgs | /assets/hero-video.mp4, https://assets.mixkit.co/videos/preview/mixkit-carpenter-measuring-a-wooden-board-42352-large.mp4, https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-41528-large.mp4, about:blank, https://maps.google.com/maps?q=160+Ogui+Rd+Enugu+Nigeria&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed |
| `m/my-requests/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 3 remote imgs | None |
| `m/order-confirmation/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 4 remote imgs | None |
| `m/product/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 6 remote imgs | None |
| `m/shop/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 5 remote imgs | None |
| `m/sign-in/index.html` | tailwindcss-cdn, /assets/site.js | 4 font/style links | 0 remote imgs | None |
| `m/track-order/index.html` | tailwindcss-cdn, /assets/site.js | 5 font/style links | 6 remote imgs | None |
| `my-requests/index.html` | tailwindcss-cdn, /assets/site.js | 7 font/style links | 2 remote imgs | None |
| `order-confirmation/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 6 remote imgs | None |
| `product/index.html` | tailwindcss-cdn, /assets/site.js | 3 font/style links | 14 remote imgs | None |
| `shop/index.html` | tailwindcss-cdn, /assets/site.js | 3 font/style links | 13 remote imgs | None |
| `sign-in/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 0 remote imgs | None |
| `track-order/index.html` | tailwindcss-cdn, /assets/site.js | 6 font/style links | 7 remote imgs | None |

---

## Next Steps Progress
- [x] Step 0: Inventory and baseline
- [ ] Step 1: Compile Tailwind CSS ahead of time
- [ ] Step 2: Self-host and preload critical web fonts
- [ ] Step 3: Remote image harvesting & responsive WebP conversion
- [ ] Step 4: Hero video re-encoding & logo optimization
- [ ] Step 5: Remove duplicated and broken code
- [ ] Step 6: Instant mobile redirect in head
- [ ] Step 7: Speculation Rules and instant navigation
- [ ] Step 8: Production caching headers in vercel.json
- [ ] Step 9: Verification, screenshots & metrics comparison
