# Flutter Client Store App — Complete Build Guide

> One reference for building the **merchant mobile app** (Flutter) after a client orders an app from the Zid App Platform CMS.

This document is for your team (admin / developers). Merchants order the app from **Order New App** in the CMS. You deliver a branded Android / iOS store app powered by Flutter + this platform’s content APIs / Zid store data.

---

## 1. End-to-end flow (CMS → Flutter → Stores)

```
Merchant fills "Order New App"
        ↓
app_orders row created (platform, features, branding, business_info, price)
        ↓
Admin confirms payment → development_status moves through timeline (1–9)
        ↓
You clone/configure the Flutter white-label template for that merchant
        ↓
App reads: theme, layout, sections, banners, videos, notices (+ Zid catalog)
        ↓
Build APK / AAB / IPA → upload to Play Store / App Store
        ↓
Update applications table (apk_url, play_store_url, app_store_url, status)
```

### Where this lives in the CMS today

| Step | CMS place | DB |
|------|-----------|-----|
| Merchant orders app | `/merchant/app-order` | `app_orders` |
| Admin tracks order | `/admin/app-orders` | `app_orders`, timeline events |
| Published app record | `/admin/applications` | `applications` |
| Merchant content | Sections, Banners, Videos, Notices, Themes, Layouts | `app_sections`, `banners`, `videos`, `video_categories`, `app_notices`, `app_themes`, `app_layouts` |
| Store connection | My Store / Zid OAuth | `zid_stores` |

---

## 2. Recommended approach: one white-label Flutter template

**Do not** build a new Flutter repo from scratch for every merchant.

Build **one reusable Flutter project** (template), then for each order you only change:

1. Merchant config (`merchant_id`, API base URL, package name, app name)
2. Branding (logo, splash, colors / theme_key)
3. Enabled features (from `app_orders.features`)
4. Bundle IDs / signing keys
5. Store listing assets

That is how SaaS app builders scale.

Suggested monorepo layout:

```
zid-flutter-store/                 ← Flutter white-label template
  lib/
    main.dart
    config/
      app_config.dart              ← merchant-specific values
      env.dart
    core/                          ← theme, l10n, networking, routing
    features/
      home/
      catalog/                     ← products, categories (Zid)
      cart/
      checkout/
      orders/
      account/
      banners/
      videos/
      notices/
      search/
      wishlist/
    shared/
  assets/
    branding/                      ← per-build logo/splash (or download remotely)
  android/
  ios/
  scripts/
    bootstrap_merchant.sh          ← copies config for one merchant order
```

---

## 3. Prerequisites

Install on the machine that builds apps:

| Tool | Why |
|------|-----|
| Flutter SDK (stable) | App framework |
| Android Studio + SDK | Android builds |
| Xcode (macOS) | iOS builds |
| CocoaPods | iOS deps |
| Java 17 | Android Gradle |
| Fastlane (optional) | Automate store upload |
| Access to this CMS API / Supabase | Content + merchant config |
| Zid Partner API credentials | Products, cart, orders |

Check Flutter:

```bash
flutter doctor -v
```

Create the template once:

```bash
flutter create --org com.zidplatform --project-name zid_store_app zid_flutter_store
cd zid_flutter_store
```

Useful packages (add what you need):

```yaml
# pubspec.yaml (example)
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  http: ^1.2.0
  dio: ^5.4.0
  provider: ^6.1.0          # or riverpod / bloc
  go_router: ^14.0.0
  cached_network_image: ^3.3.0
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.0.0
  url_launcher: ^6.2.0
  video_player: ^2.8.0
  chewie: ^1.7.0
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  intl: any
```

---

## 4. Merchant-specific config (critical)

For every app order, create a config file the Flutter app reads at startup.

Example: `lib/config/app_config.dart`

```dart
class AppConfig {
  static const String merchantId = 'REPLACE_MERCHANT_UUID';
  static const String orderNumber = 'APP-1028';
  static const String appName = 'ABC Store';
  static const String apiBaseUrl = 'https://YOUR_CMS_DOMAIN'; // Next.js / API
  static const String supabaseUrl = 'https://xxxx.supabase.co';
  static const String supabaseAnonKey = 'REPLACE';
  static const String defaultLocale = 'ar'; // or 'en'
  static const String themeKey = 'teal';
  static const String layoutKey = 'classic';
  static const String primaryColor = '#0F766E';
  static const String secondaryColor = '#134E4A';
  static const String logoUrl = '';
  static const String splashUrl = '';
  static const List<String> features = [
    'featureProducts',
    'featureCategories',
    'featureSearch',
    'featureCart',
    'featureCheckout',
    'featureOrders',
    'featureCustomerAccount',
    'featurePush',
    // optional:
    // 'featureWishlist',
    // 'featureOffers',
  ];
}
```

### Map fields from CMS order → Flutter

From `app_orders` + `applications` + merchant CMS prefs:

| CMS field | Flutter use |
|-----------|-------------|
| `business_info.businessName` | App display name, splash title |
| `branding.primaryColor` / `secondaryColor` | Theme |
| `merchants.app_theme_key` / `applications.theme_key` | Load palette from `app_themes` |
| `merchants.app_layout_key` / `applications.layout_key` | Home layout (`classic`, `grid`, `banner`, `tabs`, `cards`, `split`) |
| `platform` (`ANDROID` / `IOS` / `ANDROID_IOS`) | Which binaries to build |
| `features` JSON array | Show/hide modules |
| `logo_url`, `icon_url`, `splash_url` | Branding assets |
| `merchant_id` | All content API queries |

---

## 5. What the Flutter app must show (from this CMS)

Merchant dashboard content is the **source of truth** for in-app CMS modules.

### 5.1 Themes (`app_themes`)

Keys used in this platform: `teal`, `royal`, `sand`, `rose`, `forest`, `night`.

Each theme has:

- `primary_color`, `secondary_color`, `accent_color`, `background_color`

Flutter should:

1. Fetch theme for merchant (or use baked `themeKey`)
2. Build `ThemeData` / `ColorScheme` from those hex values
3. Support light/dark only if theme requires it (`night`)

### 5.2 Layouts (`app_layouts`)

| `layout_key` | Home UI behavior |
|--------------|------------------|
| `classic` | Header + vertical sections |
| `grid` | Categories in 2-column grid |
| `banner` | Large banner first, then offers/categories |
| `tabs` | Bottom tabs: Home, Offers, Cart, Account |
| `cards` | Large spotlight cards |
| `split` | Categories side + products list side |

Implement layout as a **strategy / widget switch**, not separate apps.

### 5.3 App sections (`app_sections`)

Ordered home blocks (Home, Offers, Categories, …). Render only `status = ACTIVE`, sorted by `sort_order`. EN/AR titles: `title` / `title_ar`.

### 5.4 Banners (`banners`)

Promo carousel: `image_url`, `link_url`, `title` / `title_ar`, `sort_order`, `status`.

### 5.5 Video categories + videos

- Categories: `video_categories`
- Videos: `videos` with `video_type`:
  - `EXPLORE` → Explore Now screen
  - `EXPERIENCE` → Customer Experiences screen

Show title, thumbnail, open `video_url` (YouTube / MP4).

### 5.6 General notices (`app_notices`)

In-app announcements: title + message (EN/AR).

### 5.7 Visits (`app_visits`)

Optionally POST/increment visit count when app opens (analytics for merchant dashboard).

### 5.8 Commerce (Zid)

Products, categories, cart, checkout, orders come from **Zid APIs** using the merchant’s connected `zid_stores` tokens (server-side proxy recommended — never put Zid tokens inside the Flutter APK).

---

## 6. Suggested public APIs the Flutter app should call

Implement these on the Next.js / Supabase side (read-only for mobile). Until real routes exist, treat this as the contract.

Base: `https://YOUR_CMS_DOMAIN/api/public/store/{merchantId}/...`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/bootstrap` | theme, layout, app name, logo, features, locales |
| GET | `/sections` | active app sections |
| GET | `/banners` | active banners |
| GET | `/intro-posters` | intro / onboarding posters (max 3) |
| GET | `/app-content` | home top red bar texts |
| GET | `/notices` | active general notices (merchant-scoped) |
| GET | `/video-categories` | active categories |
| GET | `/videos?type=EXPLORE` | explore videos |
| GET | `/videos?type=EXPERIENCE` | experience videos |
| GET | `/product-reels` | YouTube Shorts linked to products (merchant-scoped) |
| GET | `/product-reels?product_id={zidProductId}` | reels for one product |
| POST | `/visits` | record app open |
| GET | `/catalog/products` | proxied Zid products |
| GET | `/catalog/categories` | proxied Zid categories |
| POST | `/cart/*`, `/checkout/*`, `/orders/*` | commerce via backend |

### Intro posters (implemented)

`GET /api/public/store/{merchantId}/intro-posters`

Images live in the public Supabase bucket `intro-posters`. Merchants upload up to 3 under **Intro Posters** in the CMS.

```json
{
  "merchant_id": "00000000-0000-0000-0000-000000000010",
  "count": 2,
  "posters": [
    {
      "id": "uuid",
      "title": "Welcome",
      "title_ar": "أهلاً بك",
      "image_url": "https://.../storage/v1/object/public/intro-posters/...",
      "sort_order": 0
    }
  ]
}
```

### App content — top bars (implemented)

`GET /api/public/store/{merchantId}/app-content`

```json
{
  "merchant_id": "00000000-0000-0000-0000-000000000010",
  "top_bars": [
    {
      "key": "top_bar_1",
      "text": "Welcome to the official store…",
      "text_ar": "مرحباً بكم…",
      "enabled": true
    },
    {
      "key": "top_bar_2",
      "text": "Free shipping for orders above SR 500…",
      "text_ar": "شحن مجاني…",
      "enabled": true
    }
  ]
}
```

Only enabled bars are returned. Merchants edit these under **App Content** in the CMS.

### Product ↔ YouTube reels (implemented)

`GET /api/public/store/{merchantId}/product-reels`

Every row is scoped by `merchant_id` so merchants never mix:

```json
{
  "merchant_id": "00000000-0000-0000-0000-000000000010",
  "count": 1,
  "reels": [
    {
      "id": "uuid",
      "merchant_id": "00000000-0000-0000-0000-000000000010",
      "product_id": "12345",
      "youtube_video_id": "abc123",
      "title": "Nike Air Max Review",
      "thumbnail": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      "url": "https://www.youtube.com/shorts/abc123",
      "product_name": "Nike Air Max",
      "product_sku": "NK-001",
      "product_image_url": "https://..."
    }
  ]
}
```

**Security rules**

- Flutter uses only public / anon keys or a mobile API key scoped to one merchant.
- Zid access tokens stay on the **server**.
- Filter all queries by `merchant_id`.
- Only return `ACTIVE` content.

Example bootstrap response:

```json
{
  "merchantId": "uuid",
  "appName": "ABC Store",
  "theme": {
    "key": "teal",
    "primaryColor": "#0F766E",
    "secondaryColor": "#134E4A",
    "accentColor": "#CCFBF1",
    "backgroundColor": "#F8FAFC"
  },
  "layoutKey": "tabs",
  "logoUrl": "https://...",
  "splashUrl": "https://...",
  "features": ["featureProducts", "featureCart", "featureCheckout", "featureOrders"],
  "defaultLocale": "ar",
  "supportedLocales": ["ar", "en"]
}
```

---

## 7. Flutter app screens (feature map)

Build screens based on ordered features. Always include shell + CMS content.

| Screen | Feature flag / source | Notes |
|--------|----------------------|-------|
| Splash | always | Logo + theme colors |
| Home | layout + sections + banners | Layout strategy |
| Categories | `featureCategories` | From Zid |
| Product list / detail | `featureProducts` | From Zid |
| Search | `featureSearch` | |
| Cart | `featureCart` | |
| Checkout | `featureCheckout` | |
| My Orders | `featureOrders` | |
| Account / login | `featureCustomerAccount` | |
| Wishlist | `featureWishlist` | optional |
| Offers | `featureOffers` + sections | |
| Explore videos | CMS videos EXPLORE | |
| Experiences videos | CMS videos EXPERIENCE | |
| Notices / inbox | CMS notices + `featurePush` | |
| Settings / language | always | EN + AR RTL |

### RTL (Arabic)

- Use Flutter `Directionality` / `flutter_localizations`
- Default for Saudi merchants: **Arabic RTL**, English optional toggle
- Mirror paddings with `EdgeInsetsDirectional`, not fixed left/right

### Bottom navigation (typical `tabs` layout)

1. Home  
2. Categories / Offers  
3. Cart  
4. Account  

Hide tabs for disabled features.

---

## 8. Folder / code structure inside Flutter

```
lib/
  main.dart
  app.dart                          # MaterialApp + locale + theme
  config/
    app_config.dart
  core/
    api/api_client.dart
    theme/app_theme.dart
    l10n/                           # AR + EN strings
    router/app_router.dart
    utils/
  features/
    bootstrap/
      bootstrap_repository.dart
      bootstrap_model.dart
    home/
      home_page.dart
      layouts/
        classic_home.dart
        grid_home.dart
        banner_home.dart
        tabs_shell.dart
        cards_home.dart
        split_home.dart
    banners/
    videos/
    notices/
    catalog/
    cart/
    checkout/
    orders/
    account/
```

Startup sequence:

```text
main()
  → load AppConfig
  → fetch /bootstrap
  → apply ThemeData + layoutKey + locale
  → register feature routes
  → show Home (or login if required)
```

---

## 9. Step-by-step: create an app for one client order

Use this checklist every time a merchant orders.

### Step A — Read the order in CMS

From Admin → App Orders → open order (e.g. `APP-1028`):

1. Merchant name / business name  
2. Platform: Android, iOS, or both  
3. Features list  
4. Branding colors / logo  
5. Zid store connected?  
6. Payment confirmed?

### Step B — Prepare merchant config

```bash
cd zid_flutter_store
cp lib/config/app_config.dart.example lib/config/app_config.dart
# edit merchantId, appName, colors, themeKey, layoutKey, features, API URL
```

Or use a script:

```bash
./scripts/bootstrap_merchant.sh \
  --merchant-id "uuid" \
  --order "APP-1028" \
  --name "ABC Store" \
  --theme teal \
  --layout tabs \
  --platform ANDROID_IOS
```

### Step C — Android identity

Edit:

- `android/app/build.gradle` → `applicationId` e.g. `com.abcstore.app`
- `AndroidManifest.xml` → label = business name  
- App icon → replace `mipmap-*` (or use flutter_launcher_icons)  
- Signing → create keystore per merchant (or shared org keystore with care)

```bash
keytool -genkey -v -keystore abc-store.jks -keyalg RSA -keysize 2048 -validity 10000 -alias abcstore
```

### Step D — iOS identity

Edit:

- Bundle ID e.g. `com.abcstore.app`
- Display name  
- Icons / splash  
- Signing team in Xcode  
- Push capability if `featurePush`

### Step E — Run locally

```bash
flutter pub get
flutter run -d android
# or
flutter run -d ios
```

Verify:

- Theme colors match CMS  
- Layout matches selected layout  
- Banners / sections / videos / notices load  
- Zid products load (if feature enabled)  
- Arabic RTL works  
- Disabled features are hidden  

### Step F — Release builds

**Android (Play Store):**

```bash
flutter build appbundle --release
# output: build/app/outputs/bundle/release/app-release.aab
```

**Android APK (direct install / testing):**

```bash
flutter build apk --release
```

**iOS:**

```bash
flutter build ipa --release
# then upload with Xcode Organizer or Transporter / Fastlane
```

### Step G — Update CMS application record

In Admin → Applications (or DB `applications`):

| Field | Value |
|-------|--------|
| `name` | Business / app name |
| `platform` | ANDROID / IOS / ANDROID_IOS |
| `version` | e.g. `1.0.0` |
| `status` | IN_PROGRESS → READY → PUBLISHED |
| `apk_url` | link to APK if offered |
| `play_store_url` | Play listing URL |
| `app_store_url` | App Store listing URL |
| `theme_key` / `layout_key` | match merchant prefs |
| `logo_url`, `icon_url`, `splash_url` | assets |
| `published_at` | when live |

Also advance `app_orders.development_status` / timeline steps so the merchant sees progress.

---

## 10. Development timeline (align with CMS order steps)

Typical 9-step timeline used by this platform:

1. Payment pending / confirmed  
2. Requirements collected (branding, features, store)  
3. App configured (Flutter config + bundle IDs)  
4. UI theme & layout applied  
5. CMS modules connected (sections, banners, videos, notices)  
6. Zid catalog & cart integrated  
7. Internal QA (EN/AR, RTL, features)  
8. Store submission (Play / App Store)  
9. Published + URLs saved in CMS  

Update the order timeline in Admin as you complete each step.

---

## 11. QA checklist before delivery

- [ ] Correct merchant content only (no other merchant data)  
- [ ] Theme colors & logo correct  
- [ ] Selected layout renders correctly  
- [ ] Active banners / sections / notices / videos only  
- [ ] Explore vs Experiences videos separated  
- [ ] EN + AR strings; RTL layout correct  
- [ ] Feature flags hide unused modules  
- [ ] Products/categories from correct Zid store  
- [ ] Cart + checkout happy path  
- [ ] Orders history  
- [ ] Push notifications (if ordered)  
- [ ] App icon + splash  
- [ ] Release signing (not debug)  
- [ ] Crash-free smoke test on real Android + iOS device  
- [ ] CMS `applications` + store URLs updated  

---

## 12. After publish — how merchants keep updating the app

Merchants should **not** need a new Flutter build for every content change.

| Change type | Needs new store build? | How |
|-------------|------------------------|-----|
| Banners, notices, videos, sections text | No | Edit in merchant CMS → app fetches API |
| Theme / layout key | Usually no | Fetch on bootstrap (or force refresh) |
| New feature module | Yes | New Flutter version |
| Package name / signing | Yes | Rebuild |
| Native splash/icon | Yes | Rebuild |
| Zid catalog products | No | Live from Zid API |

Educate merchants: content CMS updates go live after app refresh; binary updates only for native/feature changes.

---

## 13. Minimal Flutter snippets (copy-paste starting points)

### Theme from CMS hex

```dart
Color hex(String value) =>
    Color(int.parse(value.replaceFirst('#', '0xFF')));

ThemeData buildMerchantTheme({
  required String primary,
  required String secondary,
  required String accent,
  required String background,
}) {
  final p = hex(primary);
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: p, primary: p),
    scaffoldBackgroundColor: hex(background),
    appBarTheme: AppBarTheme(backgroundColor: p, foregroundColor: Colors.white),
    floatingActionButtonTheme: FloatingActionButtonThemeData(backgroundColor: hex(secondary)),
    useMaterial3: true,
  );
}
```

### Feature gate

```dart
bool hasFeature(String key) => AppConfig.features.contains(key);
```

### Layout switch

```dart
Widget buildHome(String layoutKey) {
  switch (layoutKey) {
    case 'grid':
      return const GridHome();
    case 'banner':
      return const BannerHome();
    case 'tabs':
      return const TabsShell();
    case 'cards':
      return const CardsHome();
    case 'split':
      return const SplitHome();
    case 'classic':
    default:
      return const ClassicHome();
  }
}
```

---

## 14. What you still need to build in this Node/Next CMS (for Flutter)

This guide assumes mobile-facing APIs. Add them when you start Flutter delivery:

1. Public bootstrap + content routes scoped by `merchant_id`  
2. Server proxy for Zid catalog/cart (hide tokens)  
3. Optional visit tracking endpoint  
4. Admin action: “Mark application published” with store URLs  
5. (Optional) CI job: generate `app_config.dart` from an `app_orders` row  

---

## 15. One-page summary

1. Keep **one Flutter white-label template**.  
2. For each **Order New App**, inject merchant config (id, branding, theme, layout, features).  
3. App loads CMS content (sections, banners, videos, notices) + Zid commerce via backend.  
4. Build Android / iOS → submit stores → save URLs on `applications`.  
5. Merchants update content anytime from the dashboard without a rebuild.

---

## 16. Quick command cheat sheet

```bash
# Create template (once)
flutter create --org com.zidplatform --project-name zid_store_app zid_flutter_store

# Day-to-day
flutter pub get
flutter run
flutter analyze
flutter test

# Release
flutter build apk --release
flutter build appbundle --release
flutter build ipa --release
```

---

*File purpose: single complete reference for delivering Flutter client store apps from Zid App Platform orders. Keep this file updated when public mobile APIs or layouts change.*
