export type ContentStatus = "ACTIVE" | "INACTIVE";

export type BannerItem = {
  id: string;
  title: string;
  titleAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
};

/** Supabase Storage bucket name for merchant banner images */
export const BANNER_BUCKET = "banner";

/** Max banners a merchant can upload */
export const MAX_BANNERS = 3;
