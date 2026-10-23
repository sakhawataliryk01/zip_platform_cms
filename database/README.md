# Database setup order

Run these in Supabase **SQL Editor** in this order:

1. `schema.sql` — core tables (users, merchants, apps, payments, zid_stores, …)
2. `seed.sql` — demo users / merchants / plans
3. `rls-demo-write.sql` — allow create merchant from the app (publishable key)
4. `merchant-app-cms.sql` — CMS tables (sections, banners, visits, notices, …)
5. `cleanup-and-themes.sql` — drops unused tables + app themes
6. `app-layouts.sql` — app layout designs merchants can select
7. `storage-banner-bucket.sql` — public `banner` storage bucket + upload/read policies
8. `youtube-channels.sql` — merchant YouTube channel connection for Shorts sync
9. `merchant-youtube-apps.sql` — per-merchant Google Client ID / Secret
10. `product-youtube-reels.sql` — product ↔ YouTube Shorts links (merchant-scoped for Flutter)
11. `app-content.sql` — home top-bar texts (merchant-scoped for Flutter)
12. `intro-posters.sql` — intro / onboarding posters (max 3 per merchant)
13. `storage-intro-posters-bucket.sql` — public `intro-posters` storage bucket + upload/read policies
14. `support-tickets.sql` — merchant support tickets from the Support & Help page

## Tables we keep

| Area | Tables |
|------|--------|
| Auth / accounts | `users`, `password_reset_tokens` |
| Merchants | `merchants`, `zid_stores`, `subscription_plans`, `subscriptions` |
| Mobile apps | `applications`, `app_orders`, `app_order_timeline`, `payments` |
| Platform | `notifications`, `platform_settings`, `support_tickets` |
| Merchant CMS | `app_sections`, `app_categories`, `banners`, `intro_posters`, `supervisors`, `video_categories`, `videos`, `app_visits`, `app_notices`, `app_themes`, `app_layouts`, `youtube_channels`, `merchant_youtube_apps`, `product_youtube_reels`, `app_content` |

## Tables removed

- `products`
- `customers`
- `store_orders`

(Zid product/order sync later can use the API layer without storing full mirrors in DB for now.)
