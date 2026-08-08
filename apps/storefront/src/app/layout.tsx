import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { SearchDrawer } from "@/components/navigation/SearchDrawer";

export const metadata: Metadata = { title: "Northline Supply", description: "Independent goods for life in motion." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}<CartDrawer /><SearchDrawer /></body></html>;
}
