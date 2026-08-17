export type NavigationLink = {
  label: string;
  href: string;
};

export const catalogLinks: NavigationLink[] = [
  { label: "Yeni gelenler", href: "/collections/new-arrivals" },
  { label: "Giyim", href: "/collections/clothing" },
  { label: "Aksesuarlar", href: "/collections/accessories" },
  { label: "Kültür", href: "/collections/culture" },
  { label: "İndirim", href: "/collections/sale" },
];

export const supportLinks: NavigationLink[] = [
  { label: "İletişim", href: "/contact" },
  { label: "Kargo", href: "/shipping" },
  { label: "İade", href: "/returns" },
  { label: "Beden rehberi", href: "/size-guide" },
];

export const aboutLinks: NavigationLink[] = [
  { label: "Marka hakkında", href: "/about" },
  { label: "Günlük", href: "/journal" },
];

export const legalLinks: NavigationLink[] = [
  { label: "Gizlilik politikası", href: "/privacy" },
  { label: "Kullanım koşulları", href: "/terms" },
  { label: "Mesafeli satış sözleşmesi", href: "/distance-sales" },
];
