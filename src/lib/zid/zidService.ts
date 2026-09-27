import type { Product, StoreOrder, Customer, ZidStore } from "@/types";
import {
  mockCustomers,
  mockProducts,
  mockStoreOrders,
  mockZidStore,
} from "@/lib/mock/data";

/**
 * Mock Zid integration layer.
 * Replace implementations with real Zid API calls later
 * without changing dashboard UI consumers.
 */
export type ZidConnectPayload = {
  storeUrl: string;
  storeId?: string;
};

export async function connectStore(
  _merchantId: string,
  payload: ZidConnectPayload
): Promise<ZidStore> {
  await delay(600);
  return {
    ...mockZidStore,
    storeUrl: payload.storeUrl || mockZidStore.storeUrl,
    storeId: payload.storeId || mockZidStore.storeId,
    connectionStatus: "CONNECTED",
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function disconnectStore(_merchantId: string): Promise<void> {
  await delay(400);
}

export async function syncStore(_merchantId: string): Promise<ZidStore> {
  await delay(800);
  return {
    ...mockZidStore,
    connectionStatus: "CONNECTED",
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function getStore(_merchantId: string): Promise<ZidStore> {
  await delay(200);
  return mockZidStore;
}

export async function getProducts(_merchantId: string): Promise<Product[]> {
  await delay(300);
  return mockProducts;
}

export async function getOrders(_merchantId: string): Promise<StoreOrder[]> {
  await delay(300);
  return mockStoreOrders;
}

export async function getCustomers(_merchantId: string): Promise<Customer[]> {
  await delay(300);
  return mockCustomers;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const zidService = {
  connectStore,
  disconnectStore,
  syncStore,
  getStore,
  getProducts,
  getOrders,
  getCustomers,
};

export default zidService;
