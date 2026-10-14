import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Tamil } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AK Cabs Tirunelveli | Local, Outstation & Airport Cab Service",
    template: "%s | AK Cabs",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "AK Cabs Tirunelveli | Local, Outstation & Airport Cab Service",
    description: SITE_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansTamil.variable} h-full antialiased`}
    >
      <body
      suppressHydrationWarning
      className="flex min-h-full flex-col bg-background font-sans text-foreground"
    >
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-3 focus:ring-ring/50"
        >
          Skip to content
        </a>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
