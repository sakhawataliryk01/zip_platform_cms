# Database setup order

Run these in Supabase **SQL Editor** in this order:

1. `schema.sql` — core tables (users, merchants, apps, payments, zid_stores, …)
2. `seed.sql` — demo users / merchants / plans
3. `rls-demo-write.sql` — allow create merchant from the app (publishable key)
4. `merchant-app-cms.sql` — CMS tables (sections, banners, visits, notices, …)
5. `cleanup-and-themes.sql` — drops unused tables + app themes
6. `app-layouts.sql` — app layout designs merchants can select

## Tables we keep

| Area | Tables |
|------|--------|
| Auth / accounts | `users`, `password_reset_tokens` |
| Merchants | `merchants`, `zid_stores`, `subscription_plans`, `subscriptions` |
| Mobile apps | `applications`, `app_orders`, `app_order_timeline`, `payments` |
| Platform | `notifications`, `platform_settings` |
| Merchant CMS | `app_sections`, `app_categories`, `banners`, `supervisors`, `video_categories`, `videos`, `app_visits`, `app_notices`, `app_themes`, `app_layouts` |

## Tables removed

- `products`
- `customers`
- `store_orders`

(Zid product/order sync later can use the API layer without storing full mirrors in DB for now.)
