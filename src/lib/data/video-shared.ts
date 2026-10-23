export type ContentStatus = "ACTIVE" | "INACTIVE";
export type VideoType = "EXPLORE" | "EXPERIENCE";

export type VideoCategory = {
  id: string;
  name: string;
  nameAr?: string;
  status: ContentStatus;
  createdAt: string;
};

export type VideoItem = {
  id: string;
  categoryId?: string;
  title: string;
  titleAr?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoType: VideoType;
  status: ContentStatus;
  createdAt: string;
};
