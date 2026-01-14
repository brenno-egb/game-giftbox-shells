import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "SDK Host",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
        <meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
      </head>

      <body style={{ margin: 0, padding: 0 }}>
        <ClientWrapper>{children}</ClientWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
