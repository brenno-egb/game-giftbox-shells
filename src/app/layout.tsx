import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import ClientWrapper from "./ClientWrapper";

export const metadata: Metadata = {
  title: "Games",
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
        {/* Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
        >
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v46ic8v1kp");
          `}
        </Script>

        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
        <meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet,noimageindex" />
      </head>

      <body style={{ margin: 0, padding: 0 }}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
