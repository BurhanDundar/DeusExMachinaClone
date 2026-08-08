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
  collection: string;
  color: string;
  colors: string[];
  sizes: string[];
  availableSizes: string[];
  tags: string[];
  badge?: string;
  inventoryStatus: InventoryStatus;
  tone: string;
  graphic: string;
};

const names = [
  "Signal Workshop Tee",
  "Transit Mark Tee",
  "Field Notes Tee",
  "Ridge Long Sleeve",
  "Harbour Canvas Shirt",
  "Circuit Rugby",
  "Afterdark Crew",
  "Studio Chore Jacket",
  "Relay Cap",
  "Morrow Beanie",
  "Drift Cargo Pant",
  "Atlas Work Pant",
  "Night Service Tee",
  "Index Pocket Tee",
  "Baseline Hoodie",
  "Sector Coach Jacket",
  "Sunday Track Top",
  "Public Works Tee",
  "Alpine Fleece",
  "Common Ground Shirt",
  "Gridline Short",
  "Rover Utility Vest",
  "Foundry Sweat",
  "Coastline Knit",
];
const tones = [
  "#222325",
  "#f1efe8",
  "#d2a92f",
  "#234b40",
  "#a33e38",
  "#67839c",
  "#b8b3a5",
  "#313b56",
];
export const products: Product[] = names.map((name, i) => ({
  id: `p${i + 1}`,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  name,
  description:
    "A considered everyday layer made in a durable mid-weight fabric with an easy, relaxed shape.",
  price: [49, 59, 69, 79, 89, 119][i % 6],
  originalPrice: i % 7 === 0 ? 99 : undefined,
  images: [`/products/product-${i % 8}.svg`, `/products/product-${(i + 3) % 8}.svg`],
  category: i % 5 === 0 ? "Accessories" : i % 3 === 0 ? "Women" : "Men",
  collection: i < 8 ? "New Arrivals" : i < 16 ? "Workshop Classics" : "Motion Studies",
  color: ["Coal", "Natural", "Sunfade", "Pine", "Brick", "Steel"][i % 6],
  colors: ["Coal", "Natural", "Pine"],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  availableSizes: i % 9 === 0 ? [] : ["S", "M", "L", "XL"],
  tags: ["new", i % 2 ? "utility" : "graphic"],
  badge: i % 9 === 0 ? "SOLD OUT" : i % 5 === 0 ? "EXCLUSIVE" : "NEW ARRIVAL",
  inventoryStatus: i % 9 === 0 ? "sold-out" : "available",
  tone: tones[i % tones.length],
  graphic: ["N/01", "FIELD", "NORTH", "UTILITY", "ARCHIVE", "MOTION"][i % 6],
}));
export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
