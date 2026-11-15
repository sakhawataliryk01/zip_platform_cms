import type { ZidProduct } from "@/lib/data/zid-store-shared";

/** Catalog cards used when Zid products are empty — matches merchant desk mock */
export type DeskProductCard = ZidProduct & {
  category: string;
  categoryAr: string;
  compareAtPrice?: number;
  stock: number;
};

export const DESK_DEMO_PRODUCTS: DeskProductCard[] = [
  {
    id: "desk-sw-1001",
    name: "Smart watch Pro",
    nameAr: "ساعة ذكية برو",
    sku: "SW-1001",
    category: "Electronics",
    categoryAr: "إلكترونيات",
    price: 499,
    compareAtPrice: 649,
    currency: "SAR",
    stock: 32,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
  },
  {
    id: "desk-hp-220",
    name: "Wireless headphones",
    nameAr: "سماعات لاسلكية",
    sku: "HP-220",
    category: "Electronics",
    categoryAr: "إلكترونيات",
    price: 199,
    compareAtPrice: 279,
    currency: "SAR",
    stock: 54,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
  },
  {
    id: "desk-bg-88",
    name: "Everyday bag",
    nameAr: "حقيبة يومية",
    sku: "BG-88",
    category: "Fashion",
    categoryAr: "أزياء",
    price: 149,
    compareAtPrice: 199,
    currency: "SAR",
    stock: 21,
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
  },
  {
    id: "desk-sk-14",
    name: "Hydra serum",
    nameAr: "سيروم الترطيب",
    sku: "SK-14",
    category: "Care",
    categoryAr: "عناية",
    price: 89,
    compareAtPrice: 120,
    currency: "SAR",
    stock: 67,
    imageUrl:
      "https://images.unsplash.com/photo-1620916565138-02267cf4d70d?w=800&h=800&fit=crop",
  },
  {
    id: "desk-hm-41",
    name: "Ceramic lamp",
    nameAr: "مصباح سيراميك",
    sku: "HM-41",
    category: "Home",
    categoryAr: "منزل",
    price: 259,
    compareAtPrice: 320,
    currency: "SAR",
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop",
  },
  {
    id: "desk-ft-09",
    name: "City sneakers",
    nameAr: "حذاء رياضي",
    sku: "FT-09",
    category: "Fashion",
    categoryAr: "أزياء",
    price: 349,
    compareAtPrice: 429,
    currency: "SAR",
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
  },
];
