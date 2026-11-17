import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Myanmar Movie Recap Studio" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#09090b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="my">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
