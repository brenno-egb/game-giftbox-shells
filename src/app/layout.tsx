import "./globals.css";
import ClientWrapper from "./ClientWrapper";

export const metadata = { title: "Smartico Games Host" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}