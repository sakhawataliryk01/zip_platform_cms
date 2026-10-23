export type AppContent = {
  merchantId: string;
  topBar1Text: string;
  topBar1TextAr: string;
  topBar1Enabled: boolean;
  topBar2Text: string;
  topBar2TextAr: string;
  topBar2Enabled: boolean;
  updatedAt?: string;
};

/** Flutter / public API shape */
export type AppContentPayload = {
  merchant_id: string;
  top_bars: Array<{
    key: "top_bar_1" | "top_bar_2";
    text: string;
    text_ar: string;
    enabled: boolean;
  }>;
};

export function toAppContentPayload(content: AppContent): AppContentPayload {
  return {
    merchant_id: content.merchantId,
    top_bars: [
      {
        key: "top_bar_1",
        text: content.topBar1Text,
        text_ar: content.topBar1TextAr,
        enabled: content.topBar1Enabled,
      },
      {
        key: "top_bar_2",
        text: content.topBar2Text,
        text_ar: content.topBar2TextAr,
        enabled: content.topBar2Enabled,
      },
    ],
  };
}

export function emptyAppContent(merchantId: string): AppContent {
  return {
    merchantId,
    topBar1Text: "",
    topBar1TextAr: "",
    topBar1Enabled: true,
    topBar2Text: "",
    topBar2TextAr: "",
    topBar2Enabled: true,
  };
}
