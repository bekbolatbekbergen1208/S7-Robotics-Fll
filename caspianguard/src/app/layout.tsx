import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { site } from "@/content/content";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display-face",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "800"],
});

const body = Manrope({
  variable: "--font-body-face",
  subsets: ["latin", "cyrillic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin", "cyrillic"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    images: ["/caspianguard/images/caspianguard-concept.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020910",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={site.lang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`.loader{display:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
