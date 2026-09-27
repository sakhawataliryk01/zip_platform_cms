"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tVal = useTranslations("validation");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(tVal("minPassword"));
      return;
    }
    if (password !== confirm) {
      toast.error(tVal("passwordsMatch"));
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success(t("passwordUpdated"));
    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#ccfbf1_0%,_#f8fafc_55%)] p-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-xl">{t("resetPasswordTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("resetPasswordSubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("confirmPassword")}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tCommon("loading") : t("resetPassword")}
            </Button>
            <Link
              href="/login"
              className="block text-center text-sm text-primary hover:underline"
            >
              {t("backToLogin")}
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
