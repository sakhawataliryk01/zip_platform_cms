import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createSupportTicket } from "@/lib/data/support";
import {
  isSupportCategory,
  type SupportCategory,
} from "@/lib/data/support-shared";

async function requireMerchant() {
  const user = await getSession();
  if (!user || user.role !== "MERCHANT") return null;
  return user;
}

/**
 * POST /api/merchant/support
 * Persists a support ticket (Supabase `support_tickets` or local `.data` fallback).
 * Does not send email by itself — configure an email provider separately if needed.
 */
export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const categoryRaw = String(body.category || "GENERAL").trim();

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    );
  }
  if (!subject || subject.length < 3) {
    return NextResponse.json(
      { error: "Subject must be at least 3 characters" },
      { status: 400 }
    );
  }
  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Message must be at least 10 characters" },
      { status: 400 }
    );
  }

  const category: SupportCategory = isSupportCategory(categoryRaw)
    ? categoryRaw
    : "GENERAL";

  try {
    const result = await createSupportTicket({
      merchantId: user.merchantId,
      userId: user.id,
      fullName,
      email,
      subject,
      category,
      message,
    });

    return NextResponse.json(
      {
        ok: true,
        source: result.source,
        ticket: {
          id: result.ticket.id,
          status: result.ticket.status,
          createdAt: result.ticket.createdAt,
        },
        note:
          result.source === "local"
            ? "Ticket saved locally. Run database/support-tickets.sql in Supabase for cloud persistence."
            : "Ticket saved successfully.",
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create ticket";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const user = await requireMerchant();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || null,
    endpoint: "POST /api/merchant/support",
  });
}
