import "./globals.css";

export const metadata = { title: "Smartico Games Host" };

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}