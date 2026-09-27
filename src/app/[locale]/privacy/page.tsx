import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-slate-800">
      <h1 className="mb-6 text-3xl font-semibold">
        {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
      </h1>
      <div className="space-y-4 text-sm leading-7 text-slate-600">
        <p>
          {isAr
            ? "توضح هذه السياسة كيفية تعامل منصة تطبيقات زد مع بيانات التجار والمتاجر عند ربط حساب زد."
            : "This policy explains how Zid App Platform handles merchant and store data when connecting a Zid account."}
        </p>
        <p>
          {isAr
            ? "نجمع فقط البيانات اللازمة لتشغيل الخدمة مثل معلومات الحساب، بيانات المتجر، المنتجات، والطلبات، عبر واجهات زد الرسمية."
            : "We only collect data required to operate the service, such as account details, store information, products, and orders, through official Zid APIs."}
        </p>
        <p>
          {isAr
            ? "لا نبيع بياناتك. تُخزَّن رموز الوصول بشكل آمن على الخادم ولا تُعرض في المتصفح."
            : "We do not sell your data. Access tokens are stored securely on the server and are never exposed in the browser."}
        </p>
        <p>
          {isAr
            ? "للتواصل بشأن الخصوصية: +966555683990"
            : "For privacy questions, contact: +966555683990"}
        </p>
      </div>
      <Link href="/login" className="mt-8 inline-block text-sm text-teal-700 hover:underline">
        {isAr ? "العودة لتسجيل الدخول" : "Back to login"}
      </Link>
    </main>
  );
}
