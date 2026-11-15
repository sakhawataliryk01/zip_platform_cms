import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  formatDesignSummaryMessage,
  type AdminNotificationItem,
  type DesignSummary,
} from "@/lib/data/admin-notifications-shared";
import type { AppPreviewConfig } from "@/lib/app-preview-config";
import { mockAdminNotifications } from "@/lib/mock/data";

export type { AdminNotificationItem, DesignSummary } from "@/lib/data/admin-notifications-shared";

type LocalStore = {
  notifications: AdminNotificationItem[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "admin-notifications.json");

async function readLocal(): Promise<LocalStore> {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    return {
      notifications: mockAdminNotifications.map((n) => ({
        ...n,
        type: n.type as AdminNotificationItem["type"],
      })),
    };
  }
}

async function writeLocal(store: LocalStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listAdminNotifications(): Promise<AdminNotificationItem[]> {
  const local = await readLocal();
  return [...local.notifications].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export async function markAdminNotificationRead(
  id: string
): Promise<AdminNotificationItem | null> {
  const local = await readLocal();
  const idx = local.notifications.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  local.notifications[idx] = { ...local.notifications[idx], read: true };
  await writeLocal(local);
  return local.notifications[idx];
}

export async function createDesignRequestNotification(input: {
  merchantId: string;
  merchantName: string;
  businessName: string;
  designSummary: DesignSummary;
  presetKey: string;
  preview: AppPreviewConfig;
}): Promise<AdminNotificationItem> {
  const local = await readLocal();
  const summaryKey = JSON.stringify(input.designSummary);

  // Collapse rapid repeats from the same merchant into one unread design request
  const recentIdx = local.notifications.findIndex(
    (n) =>
      n.type === "DESIGN_REQUEST" &&
      n.merchantId === input.merchantId &&
      !n.read &&
      +new Date(n.createdAt) > Date.now() - 1000 * 60 * 30
  );

  const title = `Design update from ${input.businessName}`;
  const message = `${input.merchantName} wants this app design: ${formatDesignSummaryMessage(input.designSummary)}`;

  if (recentIdx >= 0) {
    const existing = local.notifications[recentIdx];
    const existingKey = JSON.stringify(existing.designSummary || {});
    local.notifications[recentIdx] = {
      ...existing,
      title,
      message,
      designSummary: input.designSummary,
      presetKey: input.presetKey,
      preview: input.preview,
      createdAt: new Date().toISOString(),
      read: false,
    };
    // If identical summary within window, keep same timestamp-ish but still bump
    if (existingKey === summaryKey) {
      local.notifications[recentIdx].createdAt = new Date().toISOString();
    }
    await writeLocal(local);
    return local.notifications[recentIdx];
  }

  const item: AdminNotificationItem = {
    id: randomUUID(),
    title,
    message,
    type: "DESIGN_REQUEST",
    read: false,
    createdAt: new Date().toISOString(),
    merchantId: input.merchantId,
    merchantName: input.merchantName,
    businessName: input.businessName,
    designSummary: input.designSummary,
    presetKey: input.presetKey,
    preview: input.preview,
  };
  local.notifications.unshift(item);
  await writeLocal(local);
  return item;
}
