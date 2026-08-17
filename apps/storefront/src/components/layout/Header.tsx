"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { useUIStore } from "@/store/ui-store";
import { MobileMenu } from "./MobileMenu";
import { AccountAction } from "./AccountAction";

const nav = [
  { label: "Erkek", slug: "men" },
  { label: "Kadın", slug: "women" },
  { label: "Aksesuarlar", slug: "accessories" },
  { label: "Kültür", slug: "culture" },
  { label: "İndirim", slug: "sale" },
];
export function Header() {
  const s = useUIStore();
  const pathname = usePathname();
  const count = s.items.reduce((n, i) => n + i.quantity, 0);
  if (pathname === "/checkout")
    return (
      <header className="sticky top-0 z-40 h-[80px] border-b border-black/10 bg-paper">
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center px-5">
          <Link href="/" className="focus-ring">
            <Brand />
          </Link>
          <button
            onClick={s.openCart}
            className="focus-ring absolute right-4 p-2"
            aria-label={`Sepette ${count} ürün var`}
          >
            <ShoppingBag size={22} />
            <span className="sr-only">Sepet ({count})</span>
          </button>
        </div>
      </header>
    );
  return (
    <>
      <header className="sticky top-0 z-40 h-[88px] border-b border-black/5 bg-paper/95 backdrop-blur-md md:h-[96px]">
        <div className="shell relative flex h-full items-center justify-between">
          <nav className="hidden gap-7 lg:flex" aria-label="Ana menü">
            {nav.map((item) => (
              <Link
                className="focus-ring font-semibold"
                href={`/collections/${item.slug}`}
                key={item.slug}
              >
                {item.label} <span aria-hidden>＋</span>
              </Link>
            ))}
          </nav>
          <button
            onClick={s.toggleMenu}
            className="focus-ring justify-self-start p-2 lg:hidden"
            aria-label={s.menuOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {s.menuOpen ? <X /> : <Menu />}
          </button>
          <Link href="/" className="focus-ring absolute left-1/2 -translate-x-1/2">
            <Brand />
          </Link>
          <div className="fixed right-3 top-5 z-50 flex items-center gap-0 md:right-4 md:top-6 md:gap-5">
            <button
              onClick={s.openSearch}
              className="focus-ring flex items-center gap-1 p-2"
              aria-label="Ara"
            >
              <Search size={22} />
              <span className="hidden xl:inline">Ara</span>
            </button>
            <AccountAction />
            <button
              onClick={s.openCart}
              className="focus-ring relative flex items-center gap-1 p-2"
              aria-label={`Sepette ${count} ürün var`}
            >
              <ShoppingBag size={23} />
              <span className="hidden sm:inline">Sepet ({count})</span>
              <span className="absolute right-0 top-0 text-[10px] sm:hidden">{count}</span>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={s.menuOpen} close={s.closeMenu} />
    </>
  );
}
