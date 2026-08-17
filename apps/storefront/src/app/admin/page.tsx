"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Archive, Check, ImageIcon, Pencil, Plus, Save, Upload, X } from "lucide-react";
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

type ProductForm = Omit<AdminProduct, "id" | "category"> & {
  categoryId: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

type Notification = {
  tone: "success" | "error";
  text: string;
};

const statuses: ProductForm["status"][] = ["DRAFT", "ACTIVE", "ARCHIVED"];
const statusLabels: Record<ProductForm["status"], string> = {
  DRAFT: "Taslak",
  ACTIVE: "Yayında",
  ARCHIVED: "Arşivlenmiş",
};

function blankProduct(categories: AdminCategory[]): ProductForm {
  return {
    name: "",
    slug: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    status: "DRAFT",
    price: 0,
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
        stockQuantity: 0,
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
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm | null>(null);
  const [categoryForm, setCategoryForm] = useState<AdminCategory | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [saving, setSaving] = useState(false);
  const latestAuthenticatedFetch = useRef(authenticatedFetch);
  const loadedUserId = useRef<string | null>(null);

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
    if (!user || user.role !== "ADMIN" || loadedUserId.current === user.id) return;
    loadedUserId.current = user.id;
    let active = true;
    Promise.all([
      latestAuthenticatedFetch.current<AdminProduct[]>("/api/admin/catalog/products"),
      latestAuthenticatedFetch.current<AdminCategory[]>("/api/admin/catalog/categories"),
    ])
      .then(([nextProducts, nextCategories]) => {
        if (!active) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
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

  if (loading || !user) return <main className="min-h-[60vh] p-8">Yükleniyor…</main>;
  if (user.role !== "ADMIN") {
    return (
      <main className="mx-auto min-h-[60vh] max-w-2xl p-8 pt-24">
        <h1 className="display text-4xl">Erişim yok</h1>
        <p className="mt-4 text-base">Bu alan yalnızca mağaza yöneticileri içindir.</p>
      </main>
    );
  }

  async function reload() {
    const [nextProducts, nextCategories] = await Promise.all([
      authenticatedFetch<AdminProduct[]>("/api/admin/catalog/products"),
      authenticatedFetch<AdminCategory[]>("/api/admin/catalog/categories"),
    ]);
    setProducts(nextProducts);
    setCategories(nextCategories);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productForm) return;
    setSaving(true);
    setNotification(null);
    try {
      const body = {
        categoryId: productForm.categoryId,
        name: productForm.name.trim(),
        slug: productForm.slug.trim(),
        description: productForm.description.trim(),
        status: productForm.status,
        price: productForm.price,
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
          stockQuantity: variant.stockQuantity,
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
      setNotification({ tone: "success", text: "Ürün başarıyla kaydedildi." });
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

  return (
    <main className="min-h-screen bg-paper px-4 py-8 sm:px-8 lg:px-12">
      {notification && (
        <Toast notification={notification} onDismiss={() => setNotification(null)} />
      )}
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-black pb-6">
          <div>
            <p className="font-semibold uppercase tracking-[0.18em]">Binks Mağaza</p>
            <h1 className="display mt-2 text-5xl">Yönetim</h1>
          </div>
          <p className="font-semibold">
            {user.firstName} {user.lastName}
          </p>
        </header>
        <nav className="mt-6 flex gap-2" aria-label="Yönetim bölümleri">
          {(["products", "categories"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`focus-ring px-4 py-2 font-bold ${tab === item ? "bg-black text-white" : "border border-black"}`}
            >
              {item === "products" ? "Ürünler" : "Kategoriler"}
            </button>
          ))}
        </nav>
        {tab === "products" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <section>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setProductForm(blankProduct(categories));
                  setNotification(null);
                }}
                className="focus-ring mb-4 flex items-center gap-2 bg-black px-4 py-3 font-bold text-white"
              >
                <Plus size={17} /> Yeni ürün
              </button>
              <div className="mb-4 flex items-end justify-between gap-4 border-b border-black/20 pb-4">
                <div>
                  <h2 className="display text-3xl">Ürünler</h2>
                  <p className="mt-1 text-sm text-black/65">
                    Bir ürünü seçerek bilgilerini, görsellerini ve stoklarını düzenle.
                  </p>
                </div>
                <span className="shrink-0 font-bold">{products.length} ürün</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedId(product.id);
                      setNotification(null);
                    }}
                    className={`focus-ring group overflow-hidden border text-left transition-colors ${selectedId === product.id ? "border-black bg-fog" : "border-black/20 bg-white hover:border-black"}`}
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-fog">
                      {product.images[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <ImageIcon
                          className="m-auto h-full w-10 text-black/35"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="flex items-start justify-between gap-3 p-3">
                      <span className="min-w-0">
                        <strong className="block truncate">{product.name}</strong>
                        <span className="mt-1 block text-sm text-black/70">
                          {product.status} · {formatPrice(product.price)}
                        </span>
                      </span>
                      <Pencil className="mt-0.5 shrink-0" size={17} />
                    </span>
                  </button>
                ))}
              </div>
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
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <section>
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
                className="focus-ring mb-4 flex items-center gap-2 bg-black px-4 py-3 font-bold text-white"
              >
                <Plus size={17} /> Yeni kategori
              </button>
              <div className="divide-y border-y border-black/20">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryForm(category)}
                    className="focus-ring flex w-full items-center justify-between py-4 text-left"
                  >
                    <span>
                      <strong className="block">{category.name}</strong>
                      <span className="text-sm">/{category.slug}</span>
                    </span>
                    <Pencil size={17} />
                  </button>
                ))}
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
      className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 border p-4 shadow-lg ${
        success
          ? "border-emerald-800 bg-emerald-50 text-emerald-950"
          : "border-red-800 bg-red-50 text-red-950"
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
        className="focus-ring -mr-1 -mt-1 shrink-0 p-1"
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
  const input = "w-full border border-black/25 bg-white px-3 py-2 outline-none focus:border-black";
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

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-black bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/20 pb-5">
        <div>
          <h2 className="display text-3xl">Ürün düzenle</h2>
          <p className="mt-1 text-sm text-black/65">
            Bilgileri değiştir, ardından en alttaki kaydet düğmesini kullan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="focus-ring font-bold underline">
            Vazgeç
          </button>
          {onArchive && (
            <button
              type="button"
              onClick={onArchive}
              className="focus-ring flex items-center gap-1 font-bold"
            >
              <Archive size={16} /> Arşivle
            </button>
          )}
        </div>
      </div>
      <section>
        <h3 className="font-bold">Temel bilgiler</h3>
        <p className="mt-1 text-sm text-black/65">Mağazada görünen ürün bilgileri.</p>
        <label className="mt-4 block font-bold">
          Ürün adı
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`${input} mt-2`}
          />
        </label>
      </section>
      <div className="grid gap-4 border-t border-black/15 pt-6 sm:grid-cols-2">
        <label className="font-bold">
          Slug
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className={`${input} mt-2`}
          />
        </label>
        <label className="font-bold">
          Kategori
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={`${input} mt-2`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block border-t border-black/15 pt-6 font-bold">
        Açıklama
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${input} mt-2 min-h-28`}
        />
      </label>
      <section className="border-t border-black/15 pt-6">
        <h3 className="font-bold">Satış ayarları</h3>
        <p className="mt-1 text-sm text-black/65">Fiyat, görünürlük ve vitrin bilgileri.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="font-bold">
            Fiyat (₺)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className={`${input} mt-2`}
            />
          </label>
          <label className="font-bold">
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
              className={`${input} mt-2`}
            />
          </label>
          <label className="font-bold">
            Durum
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ProductForm["status"] })
              }
              className={`${input} mt-2`}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="font-bold">
            Rozet
            <input
              value={form.badge ?? ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className={`${input} mt-2`}
            />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />{" "}
          Ana sayfada öne çıkan ürün olarak göster
        </label>
      </section>
      <section className="border-t border-black/15 pt-6">
        <h3 className="font-bold">Ürün görselleri</h3>
        <p className="mt-1 text-sm text-black/65">
          İlk görsel ürünün kapak görseli olarak kullanılır. Mevcut görselin üzerine tıklayarak
          telefonundan veya bilgisayarından yenisini seçebilirsin.
        </p>
        {uploading && (
          <p className="mt-3 border border-black/20 bg-fog p-3 font-semibold">
            Görsel yükleniyor{uploadProgress === null ? "…" : `: %${uploadProgress}`}
          </p>
        )}
        {form.images.map((image, index) => (
          <div
            key={index}
            className="mt-3 grid gap-3 border border-black/15 p-3 sm:grid-cols-[9rem_1fr]"
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
              <label className="font-bold">
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
                  className={`${input} mt-2`}
                />
              </label>
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      images: form.images.filter((_, entryIndex) => entryIndex !== index),
                    })
                  }
                  className="focus-ring mt-auto flex w-fit items-center gap-1 font-bold"
                >
                  <X size={16} /> Görseli kaldır
                </button>
              )}
            </div>
          </div>
        ))}
        <ImageAddButton disabled={uploading} onSelect={addImage} />
      </section>
      <section className="border-t border-black/15 pt-6">
        <h3 className="font-bold">Ürün seçenekleri ve stok</h3>
        <p className="mt-1 text-sm text-black/65">
          Ürünün beden, renk veya model seçeneklerini ve stok miktarlarını yönetin.
        </p>
        {form.variants.map((variant, index) => (
          <div key={index} className="mt-3 border border-black/15 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="font-bold">
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
                  className={`${input} mt-2`}
                />
              </label>
              <label className="font-bold">
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
                  className={`${input} mt-2`}
                />
              </label>
              <label className="font-bold">
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
                  className={`${input} mt-2`}
                />
              </label>
              <label className="font-bold">
                Stok adedi
                <input
                  type="number"
                  min="0"
                  value={variant.stockQuantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variants: form.variants.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, stockQuantity: Number(e.target.value) }
                          : entry
                      ),
                    })
                  }
                  className={`${input} mt-2`}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 font-bold">
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
                  className="focus-ring font-bold underline"
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
                  stockQuantity: 0,
                  active: true,
                  available: true,
                },
              ],
            })
          }
          className="focus-ring mt-3 flex items-center gap-1 font-bold"
        >
          <Plus size={15} /> Yeni seçenek ekle
        </button>
      </section>
      <button
        disabled={saving}
        className="focus-ring flex w-full items-center justify-center gap-2 bg-black py-4 font-bold text-white disabled:opacity-50"
      >
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
    <div className="aspect-square overflow-hidden bg-fog">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="group relative h-full w-full text-left disabled:cursor-wait"
        aria-label={image.url ? "Görseli değiştir" : "Görsel seç"}
      >
        {image.url ? (
          <img
            src={image.url}
            alt={image.altText || productName || "Ürün görseli"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-black/55">
            Görsel seçmek için tıkla
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/75 px-2 py-2 text-center text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
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
        className="focus-ring mt-3 flex items-center gap-1 font-bold disabled:cursor-wait disabled:opacity-50"
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
  const input =
    "mt-2 w-full border border-black/25 bg-white px-3 py-2 outline-none focus:border-black";
  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-black p-5">
      <h2 className="display text-3xl">Kategori</h2>
      <label className="block font-bold">
        Ad
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={input}
        />
      </label>
      <label className="block font-bold">
        Slug
        <input
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className={input}
        />
      </label>
      <label className="block font-bold">
        Açıklama
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${input} min-h-28`}
        />
      </label>
      <label className="flex items-center gap-2 font-bold">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />{" "}
        Yayında
      </label>
      <button
        disabled={saving}
        className="focus-ring flex w-full items-center justify-center gap-2 bg-black py-4 font-bold text-white"
      >
        <Check size={17} /> Kaydet
      </button>
    </form>
  );
}
