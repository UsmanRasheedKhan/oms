import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Elite OMS — Order Management",
  description: "Luxury-grade order management system for high-end retail",
  applicationName: "Elite OMS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Elite OMS",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0B0B",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#000000',
            color: '#FFFFFF',
            borderRadius: '0px',
            fontFamily: 'monospace',
            border: '1px solid #D4AF37'
          }
        }} />
      </body>
    </html>
  );
}
