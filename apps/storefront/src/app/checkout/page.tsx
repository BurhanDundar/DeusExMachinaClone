"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CircleHelp, LockKeyhole, Search } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { CURRENCY_LABEL, formatPrice } from "@/lib/currency";
import { useAuth } from "@/auth/AuthProvider";
import { apiRequest, ApiError } from "@/lib/api";

type CheckoutConfig = {
  shippingFlatFee: number;
  freeShippingThreshold: number;
  reservationMinutes: number;
};

type CreatedOrder = { id: string; orderNumber: string; reservationExpiresAt: string | null };

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-3 text-sm outline-none placeholder:text-black/55 focus:border-black";

function Field({
  label,
  className = "",
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="sr-only">{label}</span>}
      {children}
    </label>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, authenticatedFetch } = useAuth();
  const items = useUIStore((state) => state.items);
  const [terms, setTerms] = useState(false);
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(null);
  const clientReference = useRef("");
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const shipping = checkoutConfig
    ? subtotal >= checkoutConfig.freeShippingThreshold
      ? 0
      : checkoutConfig.shippingFlatFee
    : 0;

  useEffect(() => {
    apiRequest<CheckoutConfig>("/api/checkout/config")
      .then(setCheckoutConfig)
      .catch(() => setNotice("Kargo ücreti şu anda alınamadı. Lütfen sayfayı yenileyin."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      router.push("/account/login?next=%2Fcheckout");
      return;
    }
    const orderItems = items.map((item) => ({
      variantId:
        item.variantId ??
        item.product.variants?.find(
          (variant) => (variant.size ?? variant.title) === item.size && variant.available
        )?.id,
      quantity: item.quantity,
    }));
    if (orderItems.some((item) => !item.variantId)) {
      setNotice("Sepette eski bir ürün kaydı var. Ürünü sepetten çıkarıp yeniden ekleyin.");
      return;
    }
    setCreating(true);
    setNotice("");
    const fields = new FormData(event.currentTarget);
    clientReference.current ||= crypto.randomUUID();
    try {
      const order = await authenticatedFetch<CreatedOrder>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          clientReference: clientReference.current,
          items: orderItems,
          email: fields.get("email"),
          firstName: fields.get("firstName"),
          lastName: fields.get("lastName"),
          phone: fields.get("phone"),
          addressLine1: fields.get("addressLine1"),
          addressLine2: fields.get("addressLine2"),
          district: fields.get("district"),
          city: fields.get("city"),
          postalCode: fields.get("postalCode"),
          country: "Türkiye",
        }),
      });
      setCreatedOrder(order);
      setNotice(
        `${order.orderNumber} numaralı sipariş hazırlandı. Ürünler ödeme süresi boyunca sizin için ayrıldı.`
      );
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Sipariş oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  if (!items.length)
    return (
      <main className="mx-auto max-w-xl px-5 py-20">
        <h1 className="display text-5xl">Sepetiniz boş</h1>
        <p className="mt-4 text-black/60">Ödemeye geçmeden önce sepetinize ürün ekleyin.</p>
        <Link
          className="focus-ring mt-8 inline-block bg-black px-6 py-4 font-bold text-white"
          href="/"
        >
          Alışverişe devam et
        </Link>
      </main>
    );

  return (
    <main className="bg-white lg:grid lg:grid-cols-2">
      <form
        onSubmit={submit}
        className="mx-auto w-full max-w-[540px] px-5 py-10 sm:px-8 lg:px-0 lg:py-10"
      >
        <div className="space-y-9">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-xl font-bold">İletişim</h1>
              {!user && (
                <Link className="underline" href="/account/login?next=%2Fcheckout">
                  Giriş yap
                </Link>
              )}
            </div>
            <Field label="E-posta">
              <div className="relative">
                <input
                  className={inputClass}
                  type="email"
                  name="email"
                  defaultValue={user?.email ?? ""}
                  autoComplete="email"
                  placeholder="E-posta"
                  required
                />
                <CircleHelp className="absolute right-3 top-5 text-black/55" size={16} />
              </div>
            </Field>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-bold">Teslimat</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ad">
                <input
                  className={inputClass}
                  name="firstName"
                  defaultValue={user?.firstName ?? ""}
                  autoComplete="given-name"
                  placeholder="Ad"
                  required
                />
              </Field>
              <Field label="Soyad">
                <input
                  className={inputClass}
                  name="lastName"
                  defaultValue={user?.lastName ?? ""}
                  autoComplete="family-name"
                  placeholder="Soyad"
                  required
                />
              </Field>
            </div>
            <Field label="Adres" className="mt-3">
              <div className="relative">
                <input
                  className={inputClass}
                  name="addressLine1"
                  autoComplete="street-address"
                  placeholder="Adres"
                  required
                />
                <Search className="absolute right-3 top-5 text-black/55" size={16} />
              </div>
            </Field>
            <Field label="Daire, bina veya adres tarifi" className="mt-3">
              <input
                className={inputClass}
                name="addressLine2"
                autoComplete="address-line2"
                placeholder="Daire, bina veya adres tarifi (isteğe bağlı)"
              />
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Posta kodu">
                <input
                  className={inputClass}
                  name="postalCode"
                  autoComplete="postal-code"
                  placeholder="Posta kodu"
                  required
                />
              </Field>
              <Field label="Şehir">
                <input
                  className={inputClass}
                  name="city"
                  autoComplete="address-level2"
                  placeholder="Şehir"
                  required
                />
              </Field>
            </div>
            <Field label="İlçe" className="mt-3">
              <input
                className={inputClass}
                name="district"
                autoComplete="address-level3"
                placeholder="İlçe"
                required
              />
            </Field>
            <Field label="Telefon" className="mt-3">
              <div className="relative">
                <input
                  className={inputClass}
                  name="phone"
                  defaultValue={user?.phone ?? ""}
                  type="tel"
                  autoComplete="tel"
                  placeholder="Telefon"
                  required
                />
                <CircleHelp className="absolute right-3 top-5 text-black/55" size={16} />
              </div>
            </Field>
          </section>
          <section>
            <h2 className="text-xl font-bold">Kargo yöntemi</h2>
            <div className="mt-3 flex justify-between rounded-xl border border-black/15 px-5 py-4 text-sm">
              <span>Standart teslimat</span>
              <strong>
                {!checkoutConfig
                  ? "Hesaplanıyor…"
                  : shipping === 0
                    ? "Ücretsiz"
                    : formatPrice(shipping)}
              </strong>
            </div>
            {checkoutConfig && shipping > 0 && (
              <p className="mt-2 text-xs text-black/60">
                {formatPrice(checkoutConfig.freeShippingThreshold)} ve üzeri siparişlerde kargo
                ücretsizdir.
              </p>
            )}
          </section>
          <section>
            <h2 className="text-xl font-bold">Ödeme</h2>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-black/15 bg-black/[.035] p-4">
              <LockKeyhole className="mt-0.5 shrink-0" size={20} />
              <p className="text-sm leading-6">
                Kart bilgileri bu siteye girilmeyecek. Ödeme, iyzico’nun güvenli ödeme sayfasında
                tamamlanacak.
              </p>
            </div>
          </section>
          <section>
            <label className="flex items-start gap-2 text-sm">
              <input
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
                className="mt-0.5"
                type="checkbox"
                required
              />
              Okudum ve kabul ediyorum:{" "}
              <a className="underline" href="/distance-sales">
                Hizmet Koşulları.
              </a>
            </label>
            <button
              className="mt-8 w-full rounded-xl bg-[#202020] py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-black/20"
              disabled={!terms || creating || !checkoutConfig || Boolean(createdOrder)}
              type="submit"
            >
              {creating
                ? "Sipariş hazırlanıyor…"
                : createdOrder
                  ? "Sipariş hazırlandı"
                  : "Siparişi ödeme için hazırla"}
            </button>
            {notice && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950" role="status">
                {notice}
              </p>
            )}
            {createdOrder && (
              <Link
                href={`/account/orders/${createdOrder.id}`}
                className="focus-ring mt-3 inline-block font-bold underline"
              >
                Sipariş ayrıntılarını görüntüle
              </Link>
            )}
            <div className="mt-10 flex gap-5 border-t border-black/15 pt-4 text-sm underline">
              <a href="/returns">İade politikası</a>
              <a href="/privacy">Gizlilik politikası</a>
              <a href="/terms">Hizmet koşulları</a>
            </div>
          </section>
        </div>
      </form>
      <OrderSummary
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        configLoaded={Boolean(checkoutConfig)}
        count={count}
      />
    </main>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  configLoaded,
  count,
}: {
  items: ReturnType<typeof useUIStore.getState>["items"];
  subtotal: number;
  shipping: number;
  configLoaded: boolean;
  count: number;
}) {
  return (
    <aside className="border-t border-black/10 bg-[#f4f4f4] lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:border-l lg:border-t-0">
      <div className="mx-auto flex h-full w-full max-w-[540px] flex-col px-5 py-8 sm:px-8 lg:mx-0 lg:px-10">
        <div className="max-h-[310px] overflow-y-auto pr-2 [scrollbar-color:#999_transparent] [scrollbar-width:thin]">
          {items.map((item) => (
            <div
              className="grid grid-cols-[64px_1fr_auto] items-center gap-3 py-2"
              key={item.product.id + item.size}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl border border-black/15 bg-white">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-black text-xs text-white">
                  {item.quantity}
                </span>
              </div>
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-black/55">
                  {item.product.color} / {item.size}
                </p>
              </div>
              <p>{formatPrice(item.product.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ara toplam · {count} ürün</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kargo</span>
            <span className="text-black/55">
              {!configLoaded
                ? "Hesaplanıyor…"
                : shipping === 0
                  ? "Ücretsiz"
                  : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2 text-lg font-bold">
            <span>Toplam</span>
            <span>
              <small className="mr-1 text-xs font-normal text-black/55">{CURRENCY_LABEL}</small>
              {formatPrice(subtotal + shipping)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
