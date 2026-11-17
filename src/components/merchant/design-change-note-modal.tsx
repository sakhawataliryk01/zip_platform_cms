"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DesignChangeNoteModal({
  open,
  changes,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  changes: string[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const t = useTranslations("merchant.appStudio.changeNote");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="design-change-note-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#e7e2d6] bg-white p-5 shadow-xl">
        <h2
          id="design-change-note-title"
          className="text-lg font-semibold text-desk-ink"
        >
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-desk-muted">{t("subtitle")}</p>

        {changes.length > 0 ? (
          <div className="mt-4 rounded-xl border border-[#e7e2d6] bg-[#fbfaf6] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-desk-muted">
              {t("detected")}
            </p>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-desk-ink">
              {changes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          <Label htmlFor="design-change-note">{t("label")}</Label>
          <Textarea
            id="design-change-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder={t("placeholder")}
            className="resize-none"
            autoFocus
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            {t("later")}
          </Button>
          <Button
            type="button"
            className="bg-desk-green text-white hover:bg-[#346940]"
            disabled={submitting || note.trim().length < 3}
            onClick={() => onSubmit(note.trim())}
          >
            {submitting ? t("sending") : t("send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
