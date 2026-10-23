export type ProductYoutubeReel = {
  id: string;
  merchantId: string;
  productId: string;
  productName?: string;
  productSku?: string;
  productImageUrl?: string;
  youtubeVideoId: string;
  title: string;
  thumbnail?: string;
  url: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt?: string;
};

/** Shape stored / returned for Flutter & APIs */
export type ProductYoutubeReelPayload = {
  youtube_video_id: string;
  title: string;
  thumbnail: string;
  url: string;
  product_id: string;
  merchant_id: string;
  product_name?: string;
  product_sku?: string;
  product_image_url?: string;
};

export function toFlutterReelPayload(
  reel: ProductYoutubeReel
): ProductYoutubeReelPayload {
  return {
    youtube_video_id: reel.youtubeVideoId,
    title: reel.title,
    thumbnail: reel.thumbnail || "",
    url: reel.url,
    product_id: reel.productId,
    merchant_id: reel.merchantId,
    product_name: reel.productName,
    product_sku: reel.productSku,
    product_image_url: reel.productImageUrl,
  };
}
