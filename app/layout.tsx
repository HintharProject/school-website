import type { Metadata } from "next";
import { Inter, Outfit, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import { getServerLocale } from "@/lib/i18n/serverLocale";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const notoMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-myanmar",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://hinthar.thawyezaw.workers.dev"
  ),
  title: {
    default: "Hinthar International School | Pearson Edexcel Centre",
    template: "%s | Hinthar International School",
  },
  description:
    "Approved Pearson Edexcel International School across 4 campuses in Yangon and Mawlamyine — offering Lower Secondary (Year 7–9), International GCSE (IGCSE), and International A-Level (IAL).",
  keywords: [
    "Hinthar International School",
    "Pearson Edexcel Myanmar",
    "Pearson IGCSE Yangon",
    "Pearson IAL Yangon",
    "Mawlamyine International School",
    "Lower Secondary Year 7-9",
  ],
  icons: {
    icon: "/images/Hinthar_logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Hinthar International School",
    title: "Hinthar International School | Pearson Edexcel Centre",
    description:
      "Approved Pearson Edexcel Centre across Yangon & Mawlamyine — Lower Secondary (Year 7–9), IGCSE, and International A-Level (IAL).",
    images: [{ url: "/images/Hinthar_logo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "Hinthar International School",
    description:
      "Approved Pearson Edexcel Centre across Yangon & Mawlamyine — Year 7–9, IGCSE, and IAL.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      data-locale={locale}
      className={`${inter.variable} ${outfit.variable} ${notoMyanmar.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="bg-white text-[#1E232B] overflow-x-hidden antialiased"
        suppressHydrationWarning
      >
        <LocaleProvider initialLocale={locale}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:bg-[#0F2759] focus:text-white focus:px-4 focus:py-2.5 focus:rounded-xl focus:text-xs focus:font-bold focus:shadow-lg"
          >
            Skip to main content
          </a>
          <div id="main-content">{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
