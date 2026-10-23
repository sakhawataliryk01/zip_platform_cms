export type ContentStatus = "ACTIVE" | "INACTIVE";

export type IntroPosterItem = {
  id: string;
  title: string;
  titleAr?: string;
  imageUrl: string;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
};

/** Supabase Storage bucket for intro / onboarding posters */
export const INTRO_POSTERS_BUCKET = "intro-posters";

/** Max intro posters a merchant can upload */
export const MAX_INTRO_POSTERS = 3;
