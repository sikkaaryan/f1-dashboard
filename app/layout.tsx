import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Cockpit",
  description: "A technical Formula One cockpit dashboard for iPhone.",
  manifest: "/manifest.webmanifest",
  applicationName: "F1 Cockpit",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "F1 Cockpit"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07090c"
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
