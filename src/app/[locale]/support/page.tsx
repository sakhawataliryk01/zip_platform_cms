import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-slate-800">
      <h1 className="mb-6 text-3xl font-semibold">
        {isAr ? "الدعم" : "Support"}
      </h1>
      <div className="space-y-4 text-sm leading-7 text-slate-600">
        <p>
          {isAr
            ? "إذا كنت تحتاج مساعدة في ربط متجر زد أو إدارة التطبيق، تواصل معنا:"
            : "If you need help connecting your Zid store or managing your app, contact us:"}
        </p>
        <ul className="list-disc ps-5">
          <li>
            {isAr ? "الهاتف:" : "Phone:"}{" "}
            <a className="text-teal-700 hover:underline" href="tel:+966555683990">
              +966555683990
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              className="text-teal-700 hover:underline"
              href="https://wa.me/966555683990"
              target="_blank"
              rel="noreferrer"
            >
              https://wa.me/966555683990
            </a>
          </li>
        </ul>
      </div>
      <Link href="/login" className="mt-8 inline-block text-sm text-teal-700 hover:underline">
        {isAr ? "العودة لتسجيل الدخول" : "Back to login"}
      </Link>
    </main>
  );
}
