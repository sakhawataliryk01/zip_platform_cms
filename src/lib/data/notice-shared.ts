export type ContentStatus = "ACTIVE" | "INACTIVE";

export type NoticeItem = {
  id: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
};

export const MAX_NOTICES = 20;
