import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  SupportCategory,
  SupportTicket,
} from "@/lib/data/support-shared";

export type { SupportTicket } from "@/lib/data/support-shared";

type LocalStore = { tickets: SupportTicket[] };

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "support-tickets.json");

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function readLocal(): Promise<LocalStore> {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as LocalStore;
  } catch {
    return { tickets: [] };
  }
}

async function writeLocal(store: LocalStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export type CreateSupportTicketInput = {
  merchantId?: string;
  userId?: string;
  fullName: string;
  email: string;
  subject: string;
  category: SupportCategory;
  message: string;
};

export async function createSupportTicket(
  input: CreateSupportTicketInput
): Promise<{ ticket: SupportTicket; source: "supabase" | "local" }> {
  const payload = {
    merchant_id: input.merchantId || null,
    user_id: input.userId || null,
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    category: input.category,
    message: input.message.trim(),
    status: "OPEN",
  };

  try {
    const { data, error } = await sb()
      .from("support_tickets")
      .insert(payload)
      .select("id, merchant_id, user_id, full_name, email, subject, category, message, status, created_at")
      .single();

    if (!error && data) {
      return {
        source: "supabase",
        ticket: {
          id: String(data.id),
          merchantId: data.merchant_id ? String(data.merchant_id) : undefined,
          userId: data.user_id ? String(data.user_id) : undefined,
          fullName: String(data.full_name),
          email: String(data.email),
          subject: String(data.subject),
          category: data.category as SupportCategory,
          message: String(data.message),
          status: (data.status as SupportTicket["status"]) || "OPEN",
          createdAt: String(data.created_at),
        },
      };
    }
  } catch {
    // fall through to local
  }

  const ticket: SupportTicket = {
    id: randomUUID(),
    merchantId: input.merchantId,
    userId: input.userId,
    fullName: payload.full_name,
    email: payload.email,
    subject: payload.subject,
    category: input.category,
    message: payload.message,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };

  const local = await readLocal();
  local.tickets.unshift(ticket);
  await writeLocal(local);
  return { ticket, source: "local" };
}
