import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { APPLICATION } from "@/config";
import { env } from "@/env/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const applicationUrl = new URL(env.BETTER_AUTH_URL);

export const metadata: Metadata = {
  metadataBase: applicationUrl,

  title: {
    default: APPLICATION.name,
    template: `%s | ${APPLICATION.name}`,
  },

  description: APPLICATION.description,
  applicationName: APPLICATION.name,

  alternates: {
    canonical: "/",
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/app-icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/app-icon.svg",
    apple: "/apple-icon",
  },

  openGraph: {
    type: "website",
    locale: APPLICATION.locale,
    url: "/",
    siteName: APPLICATION.name,
    title: APPLICATION.name,
    description: APPLICATION.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: APPLICATION.name,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: APPLICATION.name,
    description: APPLICATION.description,
    images: ["/twitter-image"],
  },

  robots: {
    index: env.SITE_INDEXING_ENABLED,
    follow: env.SITE_INDEXING_ENABLED,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: APPLICATION.themeColor,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={APPLICATION.language}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
