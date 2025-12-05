import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catchmind - 실시간 그림 맞추기 게임",
  description: "친구들과 함께 즐기는 실시간 그림 맞추기 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
