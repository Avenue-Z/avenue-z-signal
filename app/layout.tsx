import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conversion Intelligence",
  description: "Conversion Intelligence — Website Analysis & Marketing Intelligence",
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
