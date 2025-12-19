import "./globals.css";

export const metadata = { title: "Smartico Games Host" };

import GameHubInstaller from "./GameHubInstaller";

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <GameHubInstaller />
        {children}
      </body>
    </html>
  );
}