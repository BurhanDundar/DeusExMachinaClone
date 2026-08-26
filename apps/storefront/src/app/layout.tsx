import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { SearchDrawer } from "@/components/navigation/SearchDrawer";
import { AuthProvider } from "@/auth/AuthProvider";
import { storeInfo } from "@/lib/store-info";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: storeInfo.brandName,
    template: `%s | ${storeInfo.brandName}`,
  },
  description: "Hareket hâlindeki yaşam için özgün ürünler.",
  applicationName: storeInfo.brandName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: storeInfo.brandName,
    title: storeInfo.brandName,
    description: "Hareket hâlindeki yaşam için özgün ürünler.",
    images: ["/campaign/campaign-wide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: storeInfo.brandName,
    description: "Hareket hâlindeki yaşam için özgün ürünler.",
    images: ["/campaign/campaign-wide.jpg"],
  },
  icons: { icon: "/logo/binks-machina-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <CartDrawer />
          <SearchDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
