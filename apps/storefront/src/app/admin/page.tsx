"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import {
  ArrowDown,
  ArrowUp,
  Archive,
  Check,
  FolderTree,
  ImageIcon,
  Mail,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  Save,
  ShoppingBag,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/currency";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

type ProductImage = { id?: string; url: string; altText: string | null };
type ProductVariant = {
  id?: string;
  title: string;
  sku: string;
  color: string | null;
  size: string | null;
  price: number | null;
  stockQuantity: number;
  active: boolean;
  available: boolean;
};
type ProductVariantForm = Omit<ProductVariant, "stockQuantity"> & {
  stockQuantity: number | "";
};
type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: AdminCategory;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  featured: boolean;
  sortOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
};

type ProductForm = Omit<AdminProduct, "id" | "category" | "price" | "variants"> & {
  categoryId: string;
  price: number | "";
  images: ProductImage[];
  variants: ProductVariantForm[];
};

type Notification = {
  tone: "success" | "error";
  text: string;
};

type AdminTab = "products" | "categories" | "orders" | "newsletter";

type NewsletterSubscriber = {
  id: string;
  email: string;
  active: boolean;
  consentAt: string;
  subscribedAt: string;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  customerEmail: string;
  firstName: string;
  lastName: string;
  city: string;
  createdAt: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  reservationExpiresAt: string | null;
  items: Array<{ productName: string; optionTitle: string; quantity: number }>;
};

const orderStatusLabels: Record<string, string> = {
  PAYMENT_PENDING: "Ödeme bekleniyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya verildi",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Ödeme bekleniyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade edildi",
};

const statuses: ProductForm["status"][] = ["DRAFT", "ACTIVE", "ARCHIVED"];
const statusLabels: Record<ProductForm["status"], string> = {
  DRAFT: "Taslak",
  ACTIVE: "Yayında",
  ARCHIVED: "Arşivlenmiş",
};

const adminTabs = [
  { id: "products", label: "Ürünler", icon: Package },
  { id: "categories", label: "Kategoriler", icon: FolderTree },
  { id: "orders", label: "Siparişler", icon: ShoppingBag },
  { id: "newsletter", label: "Bülten", icon: Mail },
] as const;

const adminInput =
  "w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-black/35 hover:border-black/25 focus:border-black/40 focus:ring-4 focus:ring-black/5";
const adminLabel = "block text-sm font-semibold text-black/80";
const primaryButton =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-50";
const secondaryButton =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm font-semibold shadow-sm transition hover:border-black/25 hover:bg-fog/70 disabled:pointer-events-none disabled:opacity-40";
const ghostButton =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:pointer-events-none disabled:opacity-40";
const panel =
  "rounded-2xl border border-black/10 bg-white shadow-[0_12px_36px_rgba(17,17,17,0.05)]";

function blankProduct(categories: AdminCategory[]): ProductForm {
  return {
    name: "",
    slug: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    status: "DRAFT",
    price: "",
    compareAtPrice: null,
    badge: null,
    featured: false,
    sortOrder: 0,
    images: [{ url: "", altText: "" }],
    variants: [
      {
        title: "Standart",
        sku: "",
        color: "",
        size: "",
        price: null,
        stockQuantity: "",
        active: true,
        available: true,
      },
    ],
  };
}

function formFromProduct(product: AdminProduct): ProductForm {
  return {
    ...product,
    categoryId: product.category.id,
    images: product.images.length ? product.images : [{ url: "", altText: "" }],
    variants: product.variants.map((variant) => ({
      ...variant,
      active: variant.active ?? variant.available,
    })),
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, accessToken, loading, authenticatedFetch } = useAuth();
  const [tab, setTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm | null>(null);
  const [categoryForm, setCategoryForm] = useState<AdminCategory | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const latestAuthenticatedFetch = useRef(authenticatedFetch);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId]
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, router, user]);

  useEffect(() => {
    latestAuthenticatedFetch.current = authenticatedFetch;
  }, [authenticatedFetch]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    let active = true;
    setDataLoading(true);
    Promise.all([
      latestAuthenticatedFetch.current<AdminProduct[]>("/api/admin/catalog/products"),
      latestAuthenticatedFetch.current<AdminCategory[]>("/api/admin/catalog/categories"),
      latestAuthenticatedFetch.current<NewsletterSubscriber[]>("/api/admin/newsletter/subscribers"),
      latestAuthenticatedFetch.current<AdminOrder[]>("/api/admin/orders"),
    ])
      .then(([nextProducts, nextCategories, nextSubscribers, nextOrders]) => {
        if (!active) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setSubscribers(nextSubscribers);
        setOrders(nextOrders);
      })
      .catch((error) => {
        if (!active) return;
        const detail =
          error instanceof ApiError && error.status === 401
            ? "Yönetim API’sine erişilemedi. Backend’i son kodla yeniden başlat veya deploy et."
            : error instanceof Error
              ? error.message
              : "Panel yüklenemedi.";
        setNotification({ tone: "error", text: detail });
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (selectedProduct) setProductForm(formFromProduct(selectedProduct));
  }, [selectedProduct]);

  useEffect(() => {
    if (!notification) return;
    const timeout = window.setTimeout(() => setNotification(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  if (loading || !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-paper p-8">
        <div className={`${panel} flex items-center gap-3 px-5 py-4 text-sm font-semibold`}>
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
          Yönetim paneli yükleniyor…
        </div>
      </main>
    );
  }
  if (user.role !== "ADMIN") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-paper p-6">
        <section className={`${panel} max-w-lg p-8 text-center`}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fog">
            <UserRound size={22} aria-hidden="true" />
          </div>
          <h1 className="display mt-5 text-4xl">Erişim yok</h1>
          <p className="mt-3 text-base text-black/60">
            Bu alan yalnızca mağaza yöneticileri içindir.
          </p>
        </section>
      </main>
    );
  }

  async function reload() {
    const [nextProducts, nextCategories, nextSubscribers, nextOrders] = await Promise.all([
      authenticatedFetch<AdminProduct[]>("/api/admin/catalog/products"),
      authenticatedFetch<AdminCategory[]>("/api/admin/catalog/categories"),
      authenticatedFetch<NewsletterSubscriber[]>("/api/admin/newsletter/subscribers"),
      authenticatedFetch<AdminOrder[]>("/api/admin/orders"),
    ]);
    setProducts(nextProducts);
    setCategories(nextCategories);
    setSubscribers(nextSubscribers);
    setOrders(nextOrders);
  }

  async function deleteStoredImages(urls: string[]) {
    if (!urls.length || !accessToken) return;
    const response = await fetch("/api/admin/uploads/delete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    });
    if (!response.ok) throw new Error("Kullanılmayan Blob görselleri temizlenemedi.");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productForm) return;
    if (
      productForm.price === "" ||
      productForm.variants.some((variant) => variant.stockQuantity === "")
    ) {
      setNotification({
        tone: "error",
        text: "Fiyat ve stok adedi alanlarını doldurmalısın.",
      });
      return;
    }
    setSaving(true);
    setNotification(null);
    try {
      const body = {
        categoryId: productForm.categoryId,
        name: productForm.name.trim(),
        slug: productForm.slug.trim(),
        description: productForm.description.trim(),
        status: productForm.status,
        price: productForm.price as number,
        badge: productForm.badge || null,
        compareAtPrice: productForm.compareAtPrice || null,
        featured: productForm.featured,
        sortOrder: productForm.sortOrder,
        images: productForm.images
          .filter((image) => image.url.trim())
          .map((image, sortOrder) => ({
            id: image.id,
            url: image.url.trim(),
            altText: image.altText?.trim() || null,
            sortOrder,
          })),
        variants: productForm.variants.map((variant, sortOrder) => ({
          id: variant.id,
          title: variant.title.trim(),
          sku: variant.sku.trim(),
          color: variant.color || null,
          size: variant.size || null,
          price: variant.price || null,
          stockQuantity: variant.stockQuantity as number,
          active: variant.active,
          sortOrder,
        })),
      };
      const path = selectedId
        ? `/api/admin/catalog/products/${selectedId}`
        : "/api/admin/catalog/products";
      const savedProduct = await authenticatedFetch<AdminProduct>(path, {
        method: selectedId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      await reload();
      setSelectedId(savedProduct.id);
      setProductForm(formFromProduct(savedProduct));
      router.refresh();
      const retainedUrls = new Set(body.images.map((image) => image.url));
      const removedUrls = (selectedProduct?.images ?? [])
        .map((image) => image.url)
        .filter((url) => !retainedUrls.has(url));
      try {
        await deleteStoredImages(removedUrls);
        setNotification({ tone: "success", text: "Ürün başarıyla kaydedildi." });
      } catch {
        setNotification({
          tone: "error",
          text: "Ürün kaydedildi ancak eski Blob görsellerinden bazıları temizlenemedi.",
        });
      }
    } catch (error) {
      setNotification({
        tone: "error",
        text:
          error instanceof ApiError
            ? error.body.fieldErrors && Object.keys(error.body.fieldErrors).length
              ? `Ürün kaydedilemedi: ${Object.values(error.body.fieldErrors)[0]}`
              : error.message
            : "Ürün kaydedilemedi. Lütfen tekrar dene.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct() {
    if (!selectedId) return;
    if (!window.confirm("Bu ürünü arşivlemek istediğinize emin misiniz?")) return;
    try {
      await authenticatedFetch(`/api/admin/catalog/products/${selectedId}`, { method: "DELETE" });
      await reload();
      setSelectedId(null);
      setProductForm(null);
      setNotification({ tone: "success", text: "Ürün arşivlendi." });
    } catch (error) {
      setNotification({
        tone: "error",
        text: error instanceof ApiError ? error.message : "Ürün arşivlenemedi.",
      });
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryForm) return;
    setSaving(true);
    try {
      const method = categories.some((category) => category.id === categoryForm.id)
        ? "PUT"
        : "POST";
      const path =
        method === "PUT"
          ? `/api/admin/catalog/categories/${categoryForm.id}`
          : "/api/admin/catalog/categories";
      const { id, ...body } = categoryForm;
      await authenticatedFetch(path, { method, body: JSON.stringify(body) });
      await reload();
      setCategoryForm(null);
      setNotification({ tone: "success", text: "Kategori başarıyla kaydedildi." });
    } catch (error) {
      setNotification({
        tone: "error",
        text: error instanceof ApiError ? error.message : "Kategori kaydedilemedi.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function updateOrder(
    orderId: string,
    body: { status: string; shippingCarrier?: string; trackingNumber?: string }
  ) {
    setSaving(true);
    setNotification(null);
    try {
      await authenticatedFetch(`/api/admin/orders/${orderId}/fulfillment`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      await reload();
      setNotification({ tone: "success", text: "Sipariş durumu güncellendi." });
    } catch (error) {
      setNotification({
        tone: "error",
        text: error instanceof ApiError ? error.message : "Sipariş güncellenemedi.",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-8 sm:py-8 lg:px-12">
      {notification && (
        <Toast notification={notification} onDismiss={() => setNotification(null)} />
      )}
      <div className="mx-auto max-w-[1440px]">
        <header className={`${panel} overflow-hidden p-6 sm:p-8`}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                Binks Mağaza
              </p>
              <h1 className="display mt-2 text-4xl sm:text-5xl">Yönetim paneli</h1>
              <p className="mt-2 max-w-xl text-sm text-black/55">
                Mağaza içeriğini, siparişleri ve müşteri iletişimini tek yerden yönet.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-black/10 bg-fog/60 py-2 pl-2 pr-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                <UserRound size={17} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-black/45">
                  Yönetici
                </span>
                <span className="block text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </span>
              </span>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Toplam ürün", value: products.length, icon: Package },
              { label: "Kategori", value: categories.length, icon: FolderTree },
              { label: "Sipariş", value: orders.length, icon: ShoppingBag },
              {
                label: "Aktif abone",
                value: subscribers.filter((subscriber) => subscriber.active).length,
                icon: Mail,
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="flex items-center gap-3 rounded-xl border border-black/10 bg-paper/70 p-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="block text-xl leading-none">{metric.value}</strong>
                    <span className="mt-1 block text-xs font-medium text-black/50">
                      {metric.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </header>
        <nav
          className="no-scrollbar sticky top-3 z-30 mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-lg shadow-black/5 backdrop-blur"
          aria-label="Yönetim bölümleri"
        >
          {adminTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={`focus-ring flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === item.id
                    ? "bg-black text-white shadow-sm"
                    : "text-black/55 hover:bg-fog/70 hover:text-black"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        {dataLoading ? (
          <section className={`${panel} mt-6 flex min-h-64 items-center justify-center p-8`}>
            <div className="flex items-center gap-3 text-sm font-semibold text-black/60">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
              Yönetim verileri yükleniyor…
            </div>
          </section>
        ) : tab === "products" ? (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <section className={`${panel} p-4 sm:p-5`}>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="display text-3xl">Ürünler</h2>
                  <p className="mt-1 text-sm text-black/55">
                    Bir ürünü seçerek bilgilerini, görsellerini ve stoklarını düzenle.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedId(null);
                    setProductForm(blankProduct(categories));
                    setNotification(null);
                  }}
                  className={primaryButton}
                >
                  <Plus size={16} /> Yeni ürün
                </button>
              </div>
              {products.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedId(product.id);
                        setNotification(null);
                      }}
                      aria-pressed={selectedId === product.id}
                      className={`focus-ring group overflow-hidden rounded-xl border text-left transition duration-200 ${
                        selectedId === product.id
                          ? "border-black/50 bg-fog/70 shadow-md ring-2 ring-black/10"
                          : "border-black/10 bg-white shadow-sm hover:-translate-y-0.5 hover:border-black/25 hover:shadow-md"
                      }`}
                    >
                      <span className="relative block aspect-[4/3] overflow-hidden bg-fog">
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.name}
                            fill
                            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 28vw"
                            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <ImageIcon
                            className="m-auto h-full w-10 text-black/35"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="flex items-start justify-between gap-3 p-3.5">
                        <span className="min-w-0">
                          <strong className="block truncate text-sm">{product.name}</strong>
                          <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-black/55">
                            <span
                              className={`rounded-full px-2 py-0.5 font-bold ${
                                product.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : product.status === "DRAFT"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-black/5 text-black/55"
                              }`}
                            >
                              {statusLabels[product.status]}
                            </span>
                            {formatPrice(product.price)}
                          </span>
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 transition group-hover:bg-black group-hover:text-white">
                          <Pencil size={14} aria-hidden="true" />
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-paper/60 p-8 text-center">
                  <PackageOpen className="text-black/30" size={30} aria-hidden="true" />
                  <strong className="mt-4">Henüz ürün yok</strong>
                  <p className="mt-1 max-w-xs text-sm text-black/50">
                    İlk ürününü ekleyerek mağaza kataloğunu oluşturmaya başlayabilirsin.
                  </p>
                </div>
              )}
            </section>
            {productForm && (
              <ProductEditor
                form={productForm}
                categories={categories}
                setForm={setProductForm}
                accessToken={accessToken}
                saving={saving}
                onNotify={setNotification}
                onSubmit={saveProduct}
                onArchive={selectedId ? archiveProduct : undefined}
                onCancel={() => {
                  setProductForm(selectedProduct ? formFromProduct(selectedProduct) : null);
                  setSelectedId(selectedProduct?.id ?? null);
                }}
              />
            )}
          </div>
        ) : tab === "categories" ? (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <section className={`${panel} p-4 sm:p-5`}>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="display text-3xl">Kategoriler</h2>
                  <p className="mt-1 text-sm text-black/55">
                    Ürünlerini mağazada düzenli koleksiyonlar altında grupla.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCategoryForm({
                      id: "",
                      name: "",
                      slug: "",
                      description: "",
                      sortOrder: categories.length,
                      active: true,
                    })
                  }
                  className={primaryButton}
                >
                  <Plus size={16} /> Yeni kategori
                </button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryForm(category)}
                    aria-pressed={categoryForm?.id === category.id}
                    className={`focus-ring group flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                      categoryForm?.id === category.id
                        ? "border-black/30 bg-fog/70 shadow-sm"
                        : "border-black/10 bg-white hover:border-black/20 hover:bg-paper"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <strong className="truncate">{category.name}</strong>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            category.active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-black/5 text-black/50"
                          }`}
                        >
                          {category.active ? "Yayında" : "Gizli"}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-sm text-black/45">
                        /{category.slug}
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 transition group-hover:bg-black group-hover:text-white">
                      <Pencil size={14} aria-hidden="true" />
                    </span>
                  </button>
                ))}
                {!categories.length && (
                  <div className="rounded-xl border border-dashed border-black/15 bg-paper/60 p-8 text-center text-sm text-black/50">
                    Henüz kategori oluşturulmamış.
                  </div>
                )}
              </div>
            </section>
            {categoryForm && (
              <CategoryEditor
                form={categoryForm}
                setForm={setCategoryForm}
                saving={saving}
                onSubmit={saveCategory}
              />
            )}
          </div>
        ) : tab === "orders" ? (
          <section className={`${panel} mt-6 overflow-hidden`}>
            <div className="flex items-end justify-between gap-5 border-b border-black/10 p-5 sm:p-6">
              <div>
                <h2 className="display text-3xl">Siparişler</h2>
                <p className="mt-1 text-sm text-black/55">
                  Ödeme ve hazırlık durumlarını takip et.
                </p>
              </div>
              <span className="rounded-full bg-fog px-3 py-1.5 text-xs font-bold">
                {orders.length} sipariş
              </span>
            </div>
            {orders.length ? (
              <div className="overflow-x-auto bg-white">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b border-black/10 bg-fog/60 text-[11px] uppercase tracking-wide text-black/50">
                    <tr>
                      <th className="px-5 py-3.5">Sipariş</th>
                      <th className="px-5 py-3.5">Müşteri</th>
                      <th className="px-5 py-3.5">Ürünler</th>
                      <th className="px-5 py-3.5">Durum</th>
                      <th className="px-5 py-3.5">İşlem</th>
                      <th className="px-5 py-3.5">Toplam</th>
                      <th className="px-5 py-3.5">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {orders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-paper/70">
                        <td className="px-5 py-4 font-bold">{order.orderNumber}</td>
                        <td className="px-5 py-4">
                          <strong className="block">
                            {order.firstName} {order.lastName}
                          </strong>
                          <span className="mt-0.5 block text-xs text-black/50">
                            {order.customerEmail} · {order.city}
                          </span>
                        </td>
                        <td className="max-w-xs px-5 py-4 text-xs leading-5 text-black/65">
                          {order.items
                            .map(
                              (item) =>
                                `${item.productName} (${item.optionTitle}) × ${item.quantity}`
                            )
                            .join(", ")}
                        </td>
                        <td className="px-5 py-4">
                          <strong
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : order.status === "SHIPPED"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {orderStatusLabels[order.status] ?? order.status}
                          </strong>
                          <span className="mt-1.5 block text-xs text-black/50">
                            {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                          </span>
                          {order.trackingNumber && (
                            <span className="mt-1 block text-xs text-black/50">
                              {order.shippingCarrier}: {order.trackingNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <OrderActions order={order} disabled={saving} onUpdate={updateOrder} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-bold">
                          {formatPrice(order.total)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-black/60">
                          {new Intl.DateTimeFormat("tr-TR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Europe/Istanbul",
                          }).format(new Date(order.createdAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="text-black/25" size={30} aria-hidden="true" />
                <strong className="mt-4">Henüz sipariş yok</strong>
                <p className="mt-1 text-sm text-black/50">
                  Yeni siparişler geldiğinde burada görünecek.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className={`${panel} mt-6 max-w-5xl overflow-hidden`}>
            <div className="flex items-end justify-between gap-5 border-b border-black/10 p-5 sm:p-6">
              <div>
                <h2 className="display text-3xl">Bülten aboneleri</h2>
                <p className="mt-1 text-sm text-black/55">
                  Pazarlama izni vererek kaydolan e-posta adresleri.
                </p>
              </div>
              <span className="rounded-full bg-fog px-3 py-1.5 text-xs font-bold">
                {subscribers.filter((subscriber) => subscriber.active).length} aktif
              </span>
            </div>
            {subscribers.length ? (
              <div className="overflow-x-auto bg-white">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-black/10 bg-fog/60 text-[11px] uppercase tracking-wide text-black/50">
                    <tr>
                      <th className="px-5 py-3.5">E-posta</th>
                      <th className="px-5 py-3.5">Durum</th>
                      <th className="px-5 py-3.5">Kayıt tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="transition-colors hover:bg-paper/70">
                        <td className="px-5 py-4 font-semibold">{subscriber.email}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                              subscriber.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-black/5 text-black/50"
                            }`}
                          >
                            {subscriber.active ? "Aktif" : "Ayrılmış"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-black/60">
                          {new Intl.DateTimeFormat("tr-TR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Europe/Istanbul",
                          }).format(new Date(subscriber.subscribedAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                <Mail className="text-black/25" size={30} aria-hidden="true" />
                <strong className="mt-4">Henüz bülten abonesi yok</strong>
                <p className="mt-1 text-sm text-black/50">
                  Yeni kayıtlar geldikçe bu liste otomatik güncellenecek.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const success = notification.tone === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={`fixed bottom-5 left-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl sm:left-auto sm:right-5 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-red-200 bg-red-50 text-red-950"
      }`}
    >
      {success ? (
        <Check className="mt-0.5 shrink-0" size={18} />
      ) : (
        <X className="mt-0.5 shrink-0" size={18} />
      )}
      <p className="pr-2 font-semibold leading-5">{notification.text}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="focus-ring -mr-1 -mt-1 shrink-0 rounded-lg p-1 transition hover:bg-black/5"
        aria-label="Bildirimi kapat"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ProductEditor({
  form,
  categories,
  setForm,
  accessToken,
  saving,
  onNotify,
  onSubmit,
  onArchive,
  onCancel,
}: {
  form: ProductForm;
  categories: AdminCategory[];
  setForm: React.Dispatch<React.SetStateAction<ProductForm | null>>;
  accessToken: string | null;
  saving: boolean;
  onNotify: (notification: Notification) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onArchive?: () => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  async function uploadImage(file: File): Promise<string> {
    if (!accessToken)
      throw new Error("Oturumun sona ermiş. Görsel yüklemek için tekrar giriş yap.");
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!acceptedTypes.includes(file.type)) {
      throw new Error("Yalnızca JPG, PNG, WebP veya AVIF görsel yükleyebilirsin.");
    }
    if (file.size > 8 * 1024 * 1024) throw new Error("Görsel dosyası en fazla 8 MB olabilir.");

    const safeName =
      file.name
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product-image";
    try {
      const blob = await upload(`products/${safeName}`, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/api/admin/uploads",
        headers: { Authorization: `Bearer ${accessToken}` },
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });
      return blob.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Görsel yüklenemedi.";
      if (/Failed to\s+retrieve the client token/i.test(message)) {
        throw new Error("Görsel depolama hazır değil. BLOB_READ_WRITE_TOKEN ayarını kontrol et.");
      }
      throw error;
    }
  }

  async function replaceImage(index: number, file: File) {
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadImage(file);
      setForm((current) =>
        current
          ? {
              ...current,
              images: current.images.map((image, imageIndex) =>
                imageIndex === index
                  ? { ...image, url, altText: image.altText?.trim() || file.name }
                  : image
              ),
            }
          : current
      );
      onNotify({
        tone: "success",
        text: "Görsel yüklendi. Değişikliği yayınlamak için Ürünü Kaydet düğmesine bas.",
      });
    } catch (error) {
      onNotify({
        tone: "error",
        text: error instanceof Error ? error.message : "Görsel yüklenemedi.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  async function addImage(file: File) {
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadImage(file);
      setForm((current) =>
        current ? { ...current, images: [...current.images, { url, altText: file.name }] } : current
      );
      onNotify({
        tone: "success",
        text: "Görsel eklendi. Değişikliği yayınlamak için Ürünü Kaydet düğmesine bas.",
      });
    } catch (error) {
      onNotify({
        tone: "error",
        text: error instanceof Error ? error.message : "Görsel yüklenemedi.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;
    const images = [...form.images];
    [images[index], images[target]] = [images[target], images[index]];
    setForm({ ...form, images });
  }

  return (
    <form onSubmit={onSubmit} className={`${panel} space-y-7 p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <h2 className="display text-3xl">Ürün düzenle</h2>
          <p className="mt-1 text-sm text-black/55">
            Bilgileri değiştir, ardından en alttaki kaydet düğmesini kullan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onCancel} className={ghostButton}>
            Vazgeç
          </button>
          {onArchive && (
            <button
              type="button"
              onClick={onArchive}
              className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              <Archive size={15} /> Arşivle
            </button>
          )}
        </div>
      </div>
      <section>
        <h3 className="text-base font-bold">Temel bilgiler</h3>
        <p className="mt-1 text-sm text-black/50">Mağazada görünen ürün bilgileri.</p>
        <label className={`${adminLabel} mt-4`}>
          Ürün adı
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`${adminInput} mt-2`}
          />
        </label>
      </section>
      <div className="grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
        <label className={adminLabel}>
          Slug
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className={`${adminInput} mt-2`}
          />
        </label>
        <label className={adminLabel}>
          Kategori
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={`${adminInput} mt-2`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={`${adminLabel} border-t border-black/10 pt-6`}>
        Açıklama
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${adminInput} mt-2 min-h-32 resize-y`}
        />
      </label>
      <section className="border-t border-black/10 pt-6">
        <h3 className="text-base font-bold">Satış ayarları</h3>
        <p className="mt-1 text-sm text-black/50">Fiyat, görünürlük ve vitrin bilgileri.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className={adminLabel}>
            Fiyat (₺)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value === "" ? "" : e.target.valueAsNumber,
                })
              }
              className={`${adminInput} admin-number-input mt-2`}
            />
          </label>
          <label className={adminLabel}>
            İndirim öncesi fiyat (₺)
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Opsiyonel"
              value={form.compareAtPrice ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  compareAtPrice: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={`${adminInput} admin-number-input mt-2`}
            />
          </label>
          <label className={adminLabel}>
            Durum
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ProductForm["status"] })
              }
              className={`${adminInput} mt-2`}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className={adminLabel}>
            Rozet
            <input
              value={form.badge ?? ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className={`${adminInput} mt-2`}
            />
          </label>
        </div>
        <label className="mt-5 flex items-center gap-2.5 text-sm font-semibold text-black/80">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 rounded border-black/20 accent-black"
          />{" "}
          Ana sayfada öne çıkan ürün olarak göster
        </label>
      </section>
      <section className="border-t border-black/10 pt-6">
        <h3 className="text-base font-bold">Ürün görselleri</h3>
        <p className="mt-1 text-sm leading-5 text-black/50">
          İlk görsel ürünün kapak görseli olarak kullanılır. Mevcut görselin üzerine tıklayarak
          telefonundan veya bilgisayarından yenisini seçebilirsin.
        </p>
        {uploading && (
          <p className="mt-4 rounded-xl border border-black/10 bg-fog/70 p-3.5 text-sm font-semibold">
            Görsel yükleniyor{uploadProgress === null ? "…" : `: %${uploadProgress}`}
          </p>
        )}
        {form.images.map((image, index) => (
          <div
            key={index}
            className="mt-4 grid gap-4 rounded-xl border border-black/10 bg-paper/50 p-3.5 sm:grid-cols-[9rem_1fr]"
          >
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-black/55">
                {index === 0 ? "Kapak görseli" : `Galeri görseli ${index + 1}`}
              </p>
              <ImagePicker
                image={image}
                productName={form.name}
                disabled={uploading}
                onSelect={(file) => replaceImage(index, file)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className={adminLabel}>
                Alt metin
                <input
                  placeholder="Örn. Siyah mekanik sanat tişörtü"
                  value={image.altText ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      images: form.images.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, altText: e.target.value } : entry
                      ),
                    })
                  }
                  className={`${adminInput} mt-2`}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  className={secondaryButton}
                >
                  <ArrowUp size={15} /> Öne taşı
                </button>
                <button
                  type="button"
                  disabled={index === form.images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  className={secondaryButton}
                >
                  <ArrowDown size={15} /> Arkaya taşı
                </button>
              </div>
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      images: form.images.filter((_, entryIndex) => entryIndex !== index),
                    })
                  }
                  className="focus-ring mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <X size={16} /> Görseli kaldır
                </button>
              )}
            </div>
          </div>
        ))}
        <ImageAddButton disabled={uploading} onSelect={addImage} />
      </section>
      <section className="border-t border-black/10 pt-6">
        <h3 className="text-base font-bold">Ürün seçenekleri ve stok</h3>
        <p className="mt-1 text-sm text-black/50">
          Ürünün beden, renk veya model seçeneklerini ve stok miktarlarını yönetin.
        </p>
        {form.variants.map((variant, index) => (
          <div key={index} className="mt-4 rounded-xl border border-black/10 bg-paper/50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={adminLabel}>
                Seçenek adı
                <input
                  required
                  value={variant.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variants: form.variants.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, title: e.target.value } : entry
                      ),
                    })
                  }
                  className={`${adminInput} mt-2`}
                />
              </label>
              <label className={adminLabel}>
                SKU
                <input
                  required
                  value={variant.sku}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variants: form.variants.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, sku: e.target.value } : entry
                      ),
                    })
                  }
                  className={`${adminInput} mt-2`}
                />
              </label>
              <label className={adminLabel}>
                Beden
                <input
                  placeholder="Örn. Standart veya M"
                  value={variant.size ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variants: form.variants.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, size: e.target.value } : entry
                      ),
                    })
                  }
                  className={`${adminInput} mt-2`}
                />
              </label>
              <label className={adminLabel}>
                Stok adedi
                <input
                  type="number"
                  min="0"
                  required
                  value={variant.stockQuantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variants: form.variants.map((entry, entryIndex) =>
                        entryIndex === index
                          ? {
                              ...entry,
                              stockQuantity: e.target.value === "" ? "" : e.target.valueAsNumber,
                            }
                          : entry
                      ),
                    })
                  }
                  className={`${adminInput} admin-number-input mt-2`}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-black/80">
                <input
                  type="checkbox"
                  checked={variant.active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variants: form.variants.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, active: e.target.checked } : entry
                      ),
                    })
                  }
                  className="h-4 w-4 rounded border-black/20 accent-black"
                />
                Satışa açık
              </label>
              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      variants: form.variants.filter((_, entryIndex) => entryIndex !== index),
                    })
                  }
                  className="focus-ring rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Seçeneği kaldır
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setForm({
              ...form,
              variants: [
                ...form.variants,
                {
                  title: "",
                  sku: "",
                  color: "",
                  size: "",
                  price: null,
                  stockQuantity: "",
                  active: true,
                  available: true,
                },
              ],
            })
          }
          className={`${secondaryButton} mt-4`}
        >
          <Plus size={15} /> Yeni seçenek ekle
        </button>
      </section>
      <button disabled={saving} className={`${primaryButton} w-full py-3.5 text-base`}>
        <Save size={17} /> {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
      </button>
    </form>
  );
}

function ImagePicker({
  image,
  productName,
  disabled,
  onSelect,
}: {
  image: ProductImage;
  productName: string;
  disabled: boolean;
  onSelect: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await onSelect(file);
  };

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-fog/70 shadow-sm">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="focus-ring group relative h-full w-full text-left disabled:cursor-wait"
        aria-label={image.url ? "Görseli değiştir" : "Görsel seç"}
      >
        {image.url ? (
          <Image
            src={image.url}
            alt={image.altText || productName || "Ürün görseli"}
            fill
            sizes="144px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm font-semibold text-black/50">
            <ImageIcon size={22} aria-hidden="true" />
            Görsel seçmek için tıkla
          </span>
        )}
        <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-2 rounded-lg bg-black/80 px-2 py-2 text-center text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Upload size={14} /> {image.url ? "Görseli değiştir" : "Görsel seç"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={chooseFile}
      />
    </div>
  );
}

function ImageAddButton({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await onSelect(file);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={`${secondaryButton} mt-4`}
      >
        <Plus size={15} /> Bilgisayardan veya telefondan görsel yükle
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={chooseFile}
      />
    </>
  );
}

function OrderActions({
  order,
  disabled,
  onUpdate,
}: {
  order: AdminOrder;
  disabled: boolean;
  onUpdate: (
    orderId: string,
    body: { status: string; shippingCarrier?: string; trackingNumber?: string }
  ) => Promise<void>;
}) {
  const [shippingCarrier, setShippingCarrier] = useState(order.shippingCarrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const buttonClass = `${primaryButton} whitespace-nowrap px-3 py-2 text-xs`;

  async function submit(status: string) {
    try {
      await onUpdate(order.id, {
        status,
        shippingCarrier: shippingCarrier.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });
    } catch {
      // Üst bileşen kullanıcıya ayrıntılı hata bildirimini gösterir.
    }
  }

  if (order.status === "PAYMENT_PENDING") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (window.confirm("Bekleyen sipariş iptal edilsin mi? Ayrılan stok geri açılır.")) {
            void submit("CANCELLED");
          }
        }}
        className="focus-ring whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
      >
        Siparişi iptal et
      </button>
    );
  }

  if (order.status === "CONFIRMED") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => void submit("PREPARING")}
        className={buttonClass}
      >
        Hazırlamaya başla
      </button>
    );
  }

  if (order.status === "PREPARING") {
    return (
      <div className="min-w-52 space-y-2.5 rounded-xl border border-black/10 bg-paper/70 p-3">
        <label className="block text-xs font-semibold text-black/70">
          Kargo firması
          <input
            value={shippingCarrier}
            onChange={(event) => setShippingCarrier(event.target.value)}
            placeholder="Örn. Yurtiçi Kargo"
            className={`${adminInput} mt-1.5 px-2.5 py-2 text-xs font-normal shadow-none`}
          />
        </label>
        <label className="block text-xs font-semibold text-black/70">
          Takip numarası
          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            className={`${adminInput} mt-1.5 px-2.5 py-2 text-xs font-normal shadow-none`}
          />
        </label>
        <button
          type="button"
          disabled={disabled || !shippingCarrier.trim() || !trackingNumber.trim()}
          onClick={() => void submit("SHIPPED")}
          className={buttonClass}
        >
          Kargoya ver
        </button>
      </div>
    );
  }

  if (order.status === "SHIPPED") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => void submit("DELIVERED")}
        className={buttonClass}
      >
        Teslim edildi
      </button>
    );
  }

  return <span className="text-xs text-black/50">İşlem yok</span>;
}

function CategoryEditor({
  form,
  setForm,
  saving,
  onSubmit,
}: {
  form: AdminCategory;
  setForm: (form: AdminCategory) => void;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className={`${panel} space-y-5 p-5 sm:p-6`}>
      <div className="border-b border-black/10 pb-5">
        <h2 className="display text-3xl">Kategori düzenle</h2>
        <p className="mt-1 text-sm text-black/50">
          Kategorinin mağazada nasıl görüneceğini düzenle.
        </p>
      </div>
      <label className={adminLabel}>
        Ad
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${adminInput} mt-2`}
        />
      </label>
      <label className={adminLabel}>
        Slug
        <input
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className={`${adminInput} mt-2`}
        />
      </label>
      <label className={adminLabel}>
        Açıklama
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${adminInput} mt-2 min-h-32 resize-y`}
        />
      </label>
      <label className="flex items-center gap-2.5 text-sm font-semibold text-black/80">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="h-4 w-4 rounded border-black/20 accent-black"
        />{" "}
        Yayında
      </label>
      <button disabled={saving} className={`${primaryButton} w-full py-3.5 text-base`}>
        <Check size={17} /> Kaydet
      </button>
    </form>
  );
}
