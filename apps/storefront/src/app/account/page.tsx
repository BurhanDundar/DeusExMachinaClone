"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { AddressManager } from "@/components/account/AddressManager";

type AccountSection = "overview" | "details" | "addresses" | "orders";

const navigation: { id: AccountSection; label: string }[] = [
  { id: "overview", label: "Genel bakış" },
  { id: "details", label: "Hesap bilgileri" },
  { id: "addresses", label: "Adresler" },
  { id: "orders", label: "Sipariş geçmişi" },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, authenticatedFetch } = useAuth();
  const [section, setSection] = useState<AccountSection>("overview");

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, user, router]);
  if (loading || !user) return <main className="min-h-[60vh] px-5 py-20">Hesap yükleniyor…</main>;

  return (
    <>
      <main className="min-h-[620px] bg-white">
        <div className="grid lg:grid-cols-[25%_75%]">
          <aside className="px-5 py-8 sm:px-8 lg:pt-28">
            <nav className="flex flex-col items-start gap-0" aria-label="Hesap menüsü">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`focus-ring flex items-center gap-2 py-1 text-left font-semibold ${section === item.id ? "" : "opacity-75 hover:opacity-100"}`}
                >
                  {section === item.id && (
                    <ArrowRight className="-ml-5" size={16} aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </button>
              ))}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="focus-ring py-1 text-left font-semibold opacity-75 transition-opacity hover:opacity-100"
                >
                  Yönetim Paneli
                </Link>
              )}
              <button
                onClick={async () => {
                  await logout();
                  router.replace("/");
                }}
                className="focus-ring py-1 text-left font-semibold opacity-75 hover:opacity-100"
              >
                Çıkış yap
              </button>
            </nav>
          </aside>
          <section className="px-5 pb-16 pt-8 sm:px-8 lg:pt-14">
            <div className="max-w-[928px]">
              {section === "overview" && <Overview firstName={user.firstName} />}
              {section === "details" && (
                <Details
                  firstName={user.firstName}
                  lastName={user.lastName}
                  email={user.email}
                  authenticatedFetch={authenticatedFetch}
                  logout={logout}
                  onSignedOut={() => router.replace("/account/login")}
                />
              )}
              {section === "addresses" && (
                <AddressManager
                  authenticatedFetch={authenticatedFetch}
                  defaultNames={{ firstName: user.firstName, lastName: user.lastName }}
                />
              )}
              {section === "orders" && <Orders authenticatedFetch={authenticatedFetch} />}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Overview({ firstName }: { firstName: string }) {
  return (
    <>
      <h1 className="display text-4xl">Hoş geldiniz, {firstName}</h1>
      <section className="mt-10">
        <h2 className="text-xl font-bold">Son siparişler</h2>
        <p className="mt-5 font-semibold">
          Siparişlerinizi “Sipariş geçmişi” bölümünden görüntüleyebilirsiniz.
        </p>
      </section>
      <div className="my-8 border-t border-black/15" />
      <section>
        <h2 className="text-xl font-bold">Teslimat adresi</h2>
        <p className="mt-5 font-semibold">
          Kayıtlı adreslerinizi “Adresler” bölümünden yönetebilirsiniz.
        </p>
      </section>
    </>
  );
}

function Details({
  firstName,
  lastName,
  email,
  authenticatedFetch,
  logout,
  onSignedOut,
}: {
  firstName: string;
  lastName: string;
  email: string;
  authenticatedFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
  logout: () => Promise<void>;
  onSignedOut: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      await authenticatedFetch<void>("/api/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await logout();
      onSignedOut();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Şifre değiştirilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="display text-4xl">Hesap bilgileri</h1>
      <div className="mt-10 font-semibold">
        <p>
          {firstName} {lastName}
        </p>
        <p>{email}</p>
      </div>
      <form
        onSubmit={changePassword}
        className="mt-8 max-w-md space-y-4 border-t border-black/15 pt-7"
      >
        <h2 className="text-xl font-bold">Şifre değiştir</h2>
        <label className="block font-semibold">
          Mevcut şifre
          <input
            required
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-2 w-full border border-black/25 bg-white px-3 py-2 outline-none focus:border-black"
          />
        </label>
        <label className="block font-semibold">
          Yeni şifre
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-2 w-full border border-black/25 bg-white px-3 py-2 outline-none focus:border-black"
          />
        </label>
        <p className="text-sm text-black/70">
          En az 8 karakter; büyük harf, küçük harf ve rakam içermeli.
        </p>
        {notice && (
          <p className="border border-red-700 bg-red-50 p-3 font-semibold text-red-900">{notice}</p>
        )}
        <button
          disabled={saving}
          className="focus-ring bg-black px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Şifreyi değiştir"}
        </button>
      </form>
    </>
  );
}

type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  trackingNumber: string | null;
  items: Array<{ productName: string; optionTitle: string; quantity: number; lineTotal: number }>;
};

const orderStatusLabels: Record<string, string> = {
  PAYMENT_PENDING: "Ödeme bekleniyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya verildi",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
};

function Orders({
  authenticatedFetch,
}: {
  authenticatedFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
}) {
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authenticatedFetch<AccountOrder[]>("/api/orders")
      .then((data) => active && setOrders(data))
      .catch((requestError) => {
        if (active)
          setError(
            requestError instanceof ApiError ? requestError.message : "Siparişler yüklenemedi."
          );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [authenticatedFetch]);

  return (
    <>
      <h1 className="display text-4xl">Sipariş geçmişi</h1>
      {loading ? (
        <p className="mt-10 font-semibold">Siparişler yükleniyor…</p>
      ) : error ? (
        <p className="mt-10 border border-red-700 bg-red-50 p-3 font-semibold text-red-900">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-10 font-semibold">Henüz sipariş vermediniz.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article className="border border-black/20 p-5" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/15 pb-4">
                <div>
                  <h2 className="font-bold">{order.orderNumber}</h2>
                  <p className="mt-1 text-sm text-black/60">
                    {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(
                      new Date(order.createdAt)
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
                      order.total
                    )}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {orderStatusLabels[order.status] ?? order.status}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {order.items.map((item, index) => (
                  <li
                    className="flex justify-between gap-4"
                    key={`${item.productName}-${item.optionTitle}-${index}`}
                  >
                    <span>
                      {item.productName} · {item.optionTitle} × {item.quantity}
                    </span>
                    <span>
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
              {order.trackingNumber && (
                <p className="mt-4 text-sm font-semibold">Kargo takip: {order.trackingNumber}</p>
              )}
              <Link
                href={`/account/orders/${order.id}`}
                className="focus-ring mt-4 inline-block font-bold underline"
              >
                Sipariş ayrıntıları
              </Link>
            </article>
          ))}
        </div>
      )}
      <div className="mt-12 border-t border-black/15" />
    </>
  );
}
