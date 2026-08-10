"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Check, ImageIcon, Pencil, Plus, Save, X } from "lucide-react";
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

const statuses: ProductForm["status"][] = ["DRAFT", "ACTIVE", "ARCHIVED"];

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
  const { user, loading, authenticatedFetch } = useAuth();
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm | null>(null);
  const [categoryForm, setCategoryForm] = useState<AdminCategory | null>(null);
  const [message, setMessage] = useState("");
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
        setMessage(detail);
      });
    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (selectedProduct) setProductForm(formFromProduct(selectedProduct));
  }, [selectedProduct]);

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
    setMessage("");
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
      setMessage("Ürün kaydedildi.");
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.body.fieldErrors && Object.keys(error.body.fieldErrors).length
            ? `Ürünü kaydetmek için şu alanları kontrol et: ${Object.values(error.body.fieldErrors).join(", ")}`
            : error.message
          : "Ürün kaydedilemedi. Lütfen tekrar dene."
      );
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct() {
    if (!selectedId || !window.confirm("Bu ürün arşivlensin mi?")) return;
    await authenticatedFetch(`/api/admin/catalog/products/${selectedId}`, { method: "DELETE" });
    await reload();
    setSelectedId(null);
    setProductForm(null);
    setMessage("Ürün arşivlendi.");
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
      setMessage("Kategori kaydedildi.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Kategori kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-black pb-6">
          <div>
            <p className="font-semibold uppercase tracking-[0.18em]">Binks Store</p>
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
        {message && (
          <p className="mt-5 border border-black bg-white p-3 font-semibold">{message}</p>
        )}
        {tab === "products" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <section>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setProductForm(blankProduct(categories));
                  setMessage("");
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
                      setMessage("");
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
                saving={saving}
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

function ProductEditor({
  form,
  categories,
  setForm,
  saving,
  onSubmit,
  onArchive,
  onCancel,
}: {
  form: ProductForm;
  categories: AdminCategory[];
  setForm: (form: ProductForm) => void;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onArchive?: () => void;
  onCancel: () => void;
}) {
  const input = "w-full border border-black/25 bg-white px-3 py-2 outline-none focus:border-black";
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
                <option key={status}>{status}</option>
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
          İlk görsel ürünün kapak görseli olarak kullanılır. Sıralama ekleme sırasına göredir.
        </p>
        {form.images.map((image, index) => (
          <div
            key={index}
            className="mt-3 grid gap-3 border border-black/15 p-3 sm:grid-cols-[9rem_1fr]"
          >
            <div className="aspect-square overflow-hidden bg-fog">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.altText || form.name || "Ürün görseli"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-black/55">
                  Görsel önizlemesi
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-bold">
                Görsel URL’si
                <input
                  required
                  placeholder="/products/... veya görsel URL’si"
                  value={image.url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      images: form.images.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, url: e.target.value } : entry
                      ),
                    })
                  }
                  className={`${input} mt-2`}
                />
              </label>
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
        <button
          type="button"
          onClick={() => setForm({ ...form, images: [...form.images, { url: "", altText: "" }] })}
          className="focus-ring mt-3 flex items-center gap-1 font-bold"
        >
          <Plus size={15} /> Görsel ekle
        </button>
      </section>
      <section className="border-t border-black/15 pt-6">
        <h3 className="font-bold">Varyantlar ve stok</h3>
        <p className="mt-1 text-sm text-black/65">
          Her varyant için benzersiz bir SKU ve mevcut stok miktarı gir.
        </p>
        {form.variants.map((variant, index) => (
          <div key={index} className="mt-3 border border-black/15 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="font-bold">
                Varyant adı
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
                  Varyantı kaldır
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
          <Plus size={15} /> Varyant ekle
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
