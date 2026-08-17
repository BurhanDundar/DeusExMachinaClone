import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { SearchDrawer } from "@/components/navigation/SearchDrawer";
import { AuthProvider } from "@/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Northline Supply",
  description: "Hareket hâlindeki yaşam için özgün ürünler.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
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
