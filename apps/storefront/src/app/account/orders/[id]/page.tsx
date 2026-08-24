"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/currency";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingTotal: number;
  total: number;
  customerEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  district: string;
  city: string;
  postalCode: string | null;
  country: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  reservationExpiresAt: string | null;
  createdAt: string;
  paidAt: string | null;
  items: Array<{
    variantId: string;
    productName: string;
    productSlug: string;
    optionTitle: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
};

const statusLabels: Record<string, string> = {
  PAYMENT_PENDING: "Ödeme bekleniyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya verildi",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
};

const paymentLabels: Record<string, string> = {
  PENDING: "Ödeme bekleniyor",
  PAID: "Ödendi",
  FAILED: "Ödeme başarısız",
  REFUNDED: "İade edildi",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading, authenticatedFetch } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !params.id) return;
    let active = true;
    authenticatedFetch<OrderDetail>(`/api/orders/${params.id}`)
      .then((data) => active && setOrder(data))
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "Sipariş ayrıntıları yüklenemedi."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [authenticatedFetch, params.id, user]);

  if (loading || (!order && !error)) {
    return <main className="min-h-[60vh] px-5 py-20">Sipariş yükleniyor…</main>;
  }

  if (error || !order) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-3xl px-5 py-20">
        <h1 className="display text-4xl">Sipariş bulunamadı</h1>
        <p className="mt-4">{error || "Bu siparişe erişilemiyor."}</p>
        <Link className="mt-6 inline-block font-bold underline" href="/account">
          Hesabıma dön
        </Link>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto min-h-[70vh] max-w-5xl px-5 py-14 sm:px-8">
        <Link className="focus-ring text-sm font-bold underline" href="/account">
          Hesabıma dön
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b border-black/20 pb-6">
          <div>
            <p className="text-sm text-black/60">Sipariş</p>
            <h1 className="display text-4xl sm:text-5xl">{order.orderNumber}</h1>
          </div>
          <div className="text-right">
            <p className="font-bold">{statusLabels[order.status] ?? order.status}</p>
            <p className="text-sm text-black/60">
              {paymentLabels[order.paymentStatus] ?? order.paymentStatus}
            </p>
          </div>
        </div>

        {order.status === "PAYMENT_PENDING" && order.reservationExpiresAt && (
          <p className="mt-5 border border-amber-600 bg-amber-50 p-4 text-sm font-semibold">
            Ürünler{" "}
            {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
              new Date(order.reservationExpiresAt)
            )}{" "}
            tarihine kadar bu sipariş için ayrıldı.
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <section>
            <h2 className="text-xl font-bold">Ürünler</h2>
            <ul className="mt-4 divide-y divide-black/15 border-y border-black/15">
              {order.items.map((item) => (
                <li className="flex justify-between gap-5 py-4" key={item.variantId}>
                  <div>
                    <Link className="font-bold underline" href={`/products/${item.productSlug}`}>
                      {item.productName}
                    </Link>
                    <p className="text-sm text-black/60">
                      {item.optionTitle} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="ml-auto mt-5 max-w-sm space-y-2">
              <div className="flex justify-between">
                <dt>Ara toplam</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Kargo</dt>
                <dd>{order.shippingTotal === 0 ? "Ücretsiz" : formatPrice(order.shippingTotal)}</dd>
              </div>
              <div className="flex justify-between border-t border-black/15 pt-3 text-lg font-bold">
                <dt>Toplam</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-7 border border-black/20 p-5">
            <section>
              <h2 className="font-bold">Teslimat adresi</h2>
              <address className="mt-2 not-italic leading-6 text-black/70">
                {order.firstName} {order.lastName}
                <br />
                {order.addressLine1}
                <br />
                {order.addressLine2 && (
                  <>
                    {order.addressLine2}
                    <br />
                  </>
                )}
                {order.district}, {order.city} {order.postalCode}
                <br />
                {order.country}
                <br />
                {order.phone}
              </address>
            </section>
            {order.trackingNumber && (
              <section>
                <h2 className="font-bold">Kargo takibi</h2>
                <p className="mt-2 text-black/70">{order.shippingCarrier}</p>
                <p className="font-semibold">{order.trackingNumber}</p>
              </section>
            )}
            <section>
              <h2 className="font-bold">Sipariş tarihi</h2>
              <p className="mt-2 text-black/70">
                {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" }).format(
                  new Date(order.createdAt)
                )}
              </p>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
