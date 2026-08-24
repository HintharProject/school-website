import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://hinthar.thawyezaw.workers.dev"
  ),
  title: {
    default: "Hinthar International School | Delivering Quality Education",
    template: "%s | Hinthar International School",
  },
  description:
    "Your gateway to a brighter future. Empowering young minds with high-quality learning experiences that inspire confidence and success. Located in Yangon, Myanmar.",
  keywords: [
    "Hinthar",
    "International School",
    "Yangon",
    "Myanmar",
    "O Level",
    "A Level",
    "BCS",
    "Education",
  ],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Hinthar International School",
    title: "Hinthar International School | Delivering Quality Education",
    description:
      "Pearson Edexcel Approved Centre in Yangon — IGCSE, IAL and Lower Secondary programs across four campuses.",
    images: [{ url: "/images/mainLogo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "Hinthar International School",
    description:
      "Pearson Edexcel Approved Centre in Yangon — IGCSE, IAL and Lower Secondary programs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface overflow-x-hidden antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[300] focus:bg-[#09234B] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-xs focus:font-bold"
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
