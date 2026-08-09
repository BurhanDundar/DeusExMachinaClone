export type InventoryStatus = "available" | "sold-out" | "coming-soon";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: [string, string];
  category: string;
  categorySlug: string;
  collection: string;
  color: string;
  colors: string[];
  sizes: string[];
  availableSizes: string[];
  tags: string[];
  badge?: string;
  inventoryStatus: InventoryStatus;
  featured: boolean;
};

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { name: string; slug: string };
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  featured: boolean;
  images: Array<{ url: string }>;
  variants: Array<{
    title: string;
    color: string | null;
    size: string | null;
    available: boolean;
  }>;
};

const catalogOrigin = (
  process.env.API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/api\/?$/, "");

const standardSize = ["Standart"];

// The API is the source of truth. These products keep the local storefront usable
// when a local backend is not running or a hosted free instance is waking up.
const offlineProducts: Product[] = [
  {
    id: "binks-01",
    slug: "kirmizi-paisley-bandana",
    name: "Kırmızı Paisley Bandana",
    description: "Kırmızı paisley desenli, günlük kullanıma uygun Binks bandana.",
    price: 349,
    images: [
      "/products/binks/bandana-paisley-koleksiyonu.jpeg",
      "/products/binks/bandana-paisley-koleksiyonu-detay.jpeg",
    ],
    category: "Aksesuar",
    categorySlug: "aksesuar",
    collection: "Aksesuar",
    color: "Siyah / Kırmızı",
    colors: ["Siyah / Kırmızı"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["bandana", "binks", "aksesuar"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-02",
    slug: "dovme-makinesi-bandana",
    name: "Dövme Makinesi Bandanası",
    description: "Mekanik dövme makinesi illüstrasyonlu koyu tonlu Binks bandana.",
    price: 349,
    images: ["/products/binks/bandana-dovme-makinesi.jpeg", "/products/binks/atolye-seti.jpeg"],
    category: "Aksesuar",
    categorySlug: "aksesuar",
    collection: "Aksesuar",
    color: "Antrasit / Kırmızı",
    colors: ["Antrasit / Kırmızı"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["bandana", "mekanik", "aksesuar"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-03",
    slug: "kirmizi-golge-bandana",
    name: "Kırmızı Gölge Bandana",
    description: "Siyah zemin üzerinde kırmızı gölge geçişli minimal Binks bandana.",
    price: 329,
    images: [
      "/products/binks/bandana-kirmizi-golge.jpeg",
      "/products/binks/bandana-kirmizi-golge-detay.jpeg",
    ],
    category: "Aksesuar",
    categorySlug: "aksesuar",
    collection: "Aksesuar",
    color: "Siyah / Bordo",
    colors: ["Siyah / Bordo"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["bandana", "minimal", "aksesuar"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-04",
    slug: "komur-ekose-is-gomlegi",
    name: "Kömür Ekose İş Gömleği",
    description: "Kömür tonlarında ekose dokulu, kırmızı Binks nakışlı iş gömleği.",
    price: 1199,
    images: ["/products/binks/gomlek-komur-ekose.jpeg", "/products/binks/gomlek-komur-ekose.jpeg"],
    category: "Giyim",
    categorySlug: "giyim",
    collection: "Giyim",
    color: "Kömür",
    colors: ["Kömür"],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L", "XL"],
    tags: ["gömlek", "iş giyim", "giyim"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-05",
    slug: "fume-is-gomlegi",
    name: "Füme İş Gömleği",
    description: "Füme dokuda, göğüs cepli ve kırmızı Binks nakışlı iş gömleği.",
    price: 1099,
    images: ["/products/binks/gomlek-fume-is.jpeg", "/products/binks/gomlek-fume-is.jpeg"],
    category: "Giyim",
    categorySlug: "giyim",
    collection: "Giyim",
    color: "Füme",
    colors: ["Füme"],
    sizes: ["S", "M", "L", "XL"],
    availableSizes: ["S", "M", "L", "XL"],
    tags: ["gömlek", "iş giyim", "giyim"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-06",
    slug: "mekanik-sanat-tisortu",
    name: "Mekanik Sanat Tişörtü",
    description: "Önünde küçük, arkasında büyük mekanik sanat baskısı bulunan siyah tişört.",
    price: 749,
    images: [
      "/products/binks/tisort-mekanik-sanat.jpeg",
      "/products/binks/tisort-mekanik-sanat.jpeg",
    ],
    category: "Giyim",
    categorySlug: "giyim",
    collection: "Giyim",
    color: "Siyah",
    colors: ["Siyah"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    tags: ["tişört", "mekanik", "giyim"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-07",
    slug: "motor-nakisli-sapka",
    name: "Motor Nakışlı Şapka",
    description: "Kırmızı motor nakışı ve Binks arma detayıyla siyah şapka.",
    price: 549,
    images: ["/products/binks/sapka-motor-nakis.jpeg", "/products/binks/sapka-motor-nakis.jpeg"],
    category: "Aksesuar",
    categorySlug: "aksesuar",
    collection: "Aksesuar",
    color: "Siyah",
    colors: ["Siyah"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["şapka", "nakış", "aksesuar"],
    badge: "ÖZEL",
    inventoryStatus: "available",
    featured: true,
  },
  {
    id: "binks-08",
    slug: "kabartmali-siyah-sapka",
    name: "Kabartmalı Siyah Şapka",
    description: "Ton sür ton kabartma motor grafikli, siyah Binks şapka.",
    price: 579,
    images: [
      "/products/binks/sapka-kabartma-siyah.jpeg",
      "/products/binks/sapka-kabartma-siyah.jpeg",
    ],
    category: "Aksesuar",
    categorySlug: "aksesuar",
    collection: "Aksesuar",
    color: "Siyah",
    colors: ["Siyah"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["şapka", "kabartma", "aksesuar"],
    badge: "ÖZEL",
    inventoryStatus: "available",
    featured: false,
  },
  {
    id: "binks-09",
    slug: "siyah-denim-atolye-onlugu",
    name: "Siyah Denim Atölye Önlüğü",
    description: "Kırmızı Binks nakışlı, ayarlanabilir askılı denim atölye önlüğü.",
    price: 899,
    images: ["/products/binks/atolye-seti.jpeg", "/products/binks/atolye-seti.jpeg"],
    category: "Giyim",
    categorySlug: "giyim",
    collection: "Giyim",
    color: "Siyah",
    colors: ["Siyah"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["önlük", "denim", "atölye"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: false,
  },
  {
    id: "binks-10",
    slug: "binks-cep-defteri",
    name: "Binks Cep Defteri",
    description: "Binks kapak seçenekleriyle kompakt, günlük notlar için cep defteri.",
    price: 179,
    images: [
      "/products/binks/defter-kapak-secenekleri.jpeg",
      "/products/binks/defter-kapak-secenekleri-detay.jpeg",
    ],
    category: "Defterler",
    categorySlug: "defterler",
    collection: "Defterler",
    color: "Çoklu Kapak",
    colors: ["Çoklu Kapak"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["defter", "cep defteri", "aksesuar"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: false,
  },
  {
    id: "binks-11",
    slug: "mekanik-sanat-defteri",
    name: "Mekanik Sanat Defteri",
    description: "Mekanik sanat kapak tasarımlı, sert kapaklı Binks defter.",
    price: 199,
    images: [
      "/products/binks/defter-mekanik-sanat.jpeg",
      "/products/binks/defter-mekanik-sanat.jpeg",
    ],
    category: "Defterler",
    categorySlug: "defterler",
    collection: "Defterler",
    color: "Siyah",
    colors: ["Siyah"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["defter", "mekanik", "aksesuar"],
    badge: "ÖZEL",
    inventoryStatus: "available",
    featured: false,
  },
  {
    id: "binks-12",
    slug: "binks-anahtarlik",
    name: "Binks Anahtarlık",
    description: "Kırmızı Binks işlemeli, dayanıklı dokuma anahtarlık.",
    price: 149,
    images: ["/products/binks/anahtarlik-binks.jpeg", "/products/binks/anahtarlik-binks.jpeg"],
    category: "Aksesuar",
    categorySlug: "aksesuar",
    collection: "Aksesuar",
    color: "Siyah / Kırmızı",
    colors: ["Siyah / Kırmızı"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["anahtarlık", "binks", "aksesuar"],
    badge: "YENİ",
    inventoryStatus: "available",
    featured: false,
  },
  {
    id: "binks-13",
    slug: "binks-koleksiyon-seti",
    name: "Binks Koleksiyon Seti",
    description: "Binks imzalı ürünleri bir araya getiren sınırlı koleksiyon kutusu.",
    price: 2199,
    images: ["/products/binks/koleksiyon-seti.jpeg", "/products/binks/kutu-binks.jpeg"],
    category: "Setler",
    categorySlug: "setler",
    collection: "Setler",
    color: "Siyah / Kırmızı",
    colors: ["Siyah / Kırmızı"],
    sizes: [...standardSize],
    availableSizes: [...standardSize],
    tags: ["koleksiyon", "set", "hediye"],
    badge: "SINIRLI SET",
    inventoryStatus: "available",
    featured: false,
  },
];

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${catalogOrigin}/api/products`, { cache: "no-store" });
    if (!response.ok) return offlineProducts;
    const catalogProducts = (await response.json()) as CatalogProduct[];
    return catalogProducts.length ? catalogProducts.map(toProduct) : offlineProducts;
  } catch {
    return offlineProducts;
  }
}

export async function productBySlug(slug: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${catalogOrigin}/api/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!response.ok) return offlineProducts.find((product) => product.slug === slug);
    return toProduct((await response.json()) as CatalogProduct);
  } catch {
    return offlineProducts.find((product) => product.slug === slug);
  }
}

function toProduct(product: CatalogProduct): Product {
  const sizes = unique(product.variants.map((variant) => variant.size ?? variant.title));
  const availableSizes = unique(
    product.variants
      .filter((variant) => variant.available)
      .map((variant) => variant.size ?? variant.title)
  );
  const colors = unique(
    product.variants
      .map((variant) => variant.color)
      .filter((color): color is string => Boolean(color))
  );
  const primaryImage = product.images[0]?.url ?? "/products/binks/koleksiyon-seti.jpeg";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.compareAtPrice ?? undefined,
    images: [primaryImage, product.images[1]?.url ?? primaryImage],
    category: product.category.name,
    categorySlug: product.category.slug,
    collection: product.category.name,
    color: colors[0] ?? "Standart",
    colors,
    sizes,
    availableSizes,
    tags: [product.category.name.toLocaleLowerCase("tr-TR")],
    badge: product.badge ?? (availableSizes.length ? undefined : "TÜKENDİ"),
    inventoryStatus: availableSizes.length ? "available" : "sold-out",
    featured: product.featured,
  };
}

function unique(values: string[]) {
  return [...new Set(values)];
}
