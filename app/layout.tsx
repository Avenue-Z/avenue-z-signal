import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avenue Z Signal",
  description: "AI CMO — Website Analysis & Marketing Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
