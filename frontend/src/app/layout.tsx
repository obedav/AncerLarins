import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ReduxProvider } from "@/store/provider";
import { ToastProvider } from "@/components/ui/Toast";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AncerLarins - Premium Real Estate in Lagos",
    template: "%s | AncerLarins",
  },
  description:
    "Discover premium properties in Lagos. Rent or buy apartments, houses, and duplexes in Lekki, Ikoyi, Victoria Island, and more. Verified agents, real listings.",
  keywords: [
    "Lagos real estate",
    "rent apartment Lagos",
    "buy house Lagos",
    "Lekki property",
    "Ikoyi apartments",
    "Victoria Island rent",
    "Nigeria property",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AncerLarins",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "AncerLarins",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1B2A4A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <ReduxProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReduxProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
