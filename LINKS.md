# Wood Lounge Links & Coverage

## Page Inventory

| Route | Source Folder | H1 / Title |
| --- | --- | --- |
| `/` | `home/hero/wooden_lounge_furniture_homepage`, `home/Nextpartafterhero1/shop_design_systems_editorial_furniture_collection`, `home/nextpartafterhero2/bestsellers_luxury_bedding_showcase`, `home/nextpartafterhero3/wooden_lounge_locations_enugu_abuja`, `footer/wooden_lounge_footer_brand_showcase` | "Wooden Lounge Furniture" (Hero + Sections merged) |
| `/m/` | `wooden_lounge_mobile_closed_menu`, `quick_links_mobile`, `bestsellers_showcase_mobile`, `wooden_lounge_locations_mobile`, `wooden_lounge_mobile_footer_brand_showcase` | "Wooden Lounge Furniture" (Mobile Hero + Sections merged) |
| `/shop/` | `wooden_lounge_living_room_furniture_product_listing` | "Living Room Furniture" |
| `/product/` | `wooden_lounge_nsukka_curved_sofa_pdp` | "Nsukka Curved Sofa" |
| `/custom-order/` | `wooden_lounge_book_a_custom_order` | "Book a Custom Order" |
| `/book-visit/` | `wooden_lounge_book_a_visit` | "Book a Visit" |
| `/sign-in/` | `wooden_lounge_sign_in_or_create_account` | "Sign in or create an account" |
| `/cart/` | `wooden_lounge_shopping_cart` | "Your Acquisitions & Commissions" |
| `/checkout/` | `wooden_lounge_checkout_with_paystack` | "Bespoke Acquisition Order" |
| `/order-confirmation/` | `wooden_lounge_order_confirmation` | "Thank you, your order is confirmed" |
| `/track-order/` | `wooden_lounge_track_your_order` | "Track Your Order" |
| `/my-requests/` | `wooden_lounge_my_requests_client_inbox` | "Client Archive & Requests" |
| `/admin/` | `wooden_lounge_admin_dashboard` | "Atelier Operations & Dispatch Dashboard" |
| `/admin/inspections/` | `wooden_lounge_admin_site_inspections` | "Site Inspection & Showroom Bookings" |
| `/admin/custom-requests/` | `wooden_lounge_admin_custom_requests` | "Custom Joinery & Bespoke Commissions" |
| `/admin/orders/` | `wooden_lounge_admin_orders_log` | "Orders & Workshop Fulfillment Ledger" |
| `/admin/payments/` | `wooden_lounge_admin_payments_log` | "Payments & Paystack Escrow Ledger" |
| `/admin/products/` | `wooden_lounge_admin_products_catalog` | "Timber Products & Bespoke Catalog" |
| `/admin/customers/` | `wooden_lounge_admin_customers_crm` | "Patron Directory & Client CRM" |

*Mobile routes (`/m/*`) mirror all the above routes completely. There are no routes without a mobile version.*

## Link Map Applied
- **Logo**: `/` (or `/admin/` on admin pages)
- **Category Nav (Lounge, Furniture, Living, Dining, Bed)**: `/shop/?room=lounge` etc.
- **Book Custom Design / Customize this piece**: `/custom-order/`
- **Book Online Visit / Book a visit / Showroom**: `/book-visit/` (appends `?type=online` for online)
- **Search Icon / Shop All / Complete the room / Load more**: `/shop/`
- **Account / Log In / Sign In**: `/sign-in/`
- **Bag / Cart**: `/cart/`
- **Any Product Card (Sofa, Chair, Bed Set, etc.)**: `/product/`
- **Add to cart**: `/cart/`
- **Proceed to checkout / Accept quote & pay**: `/checkout/`
- **Pay with Paystack**: `/order-confirmation/`
- **Track your order**: `/track-order/`
- **Continue shopping / Continue as guest**: `/shop/`
- **Footer Links**: `/`
- **Staff login**: `/admin/`
- **Admin Sidebar**: Respective `/admin/*` routes
- **Mobile Links**: `/m/*` respectively.

## Placeholders
- WhatsApp number: `+2340000000000` (Used as fallback for `wa.me` links if any were processed, though none explicitly found).

## Inert Controls (Mocked with site.js)
- Filters, Swatches, Steppers, Accordions (Details/Specifications)
- Time Chips / Calendars
- Form Submissions (Book Visit, Track Order, Custom Order, Sign In)
- Map Modal popups (View Map)
- Admin update / confirm action buttons
