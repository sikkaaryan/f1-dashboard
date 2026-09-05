import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Dashboard",
  description: "F1-inspired personal dashboard for iPhone",
  manifest: "/manifest.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
