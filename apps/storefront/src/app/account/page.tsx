"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, X } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";

type AccountSection = "overview" | "details" | "addresses" | "orders";

const navigation: { id: AccountSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Account Details" },
  { id: "addresses", label: "Addresses" },
  { id: "orders", label: "Order History" },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, authenticatedFetch } = useAuth();
  const [section, setSection] = useState<AccountSection>("overview");

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [loading, user, router]);
  if (loading || !user) return <main className="min-h-[60vh] px-5 py-20">Loading account…</main>;

  return (
    <>
      <main className="min-h-[620px] bg-white">
        <div className="grid lg:grid-cols-[25%_75%]">
          <aside className="px-5 py-8 sm:px-8 lg:pt-28">
            <nav className="flex flex-col items-start gap-0" aria-label="Account navigation">
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
              <button
                onClick={async () => {
                  await logout();
                  router.replace("/");
                }}
                className="focus-ring py-1 text-left font-semibold opacity-75 hover:opacity-100"
              >
                Logout
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
              {section === "addresses" && <Addresses />}
              {section === "orders" && <Orders />}
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
      <h1 className="display text-4xl">Welcome, {firstName}</h1>
      <section className="mt-10">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <p className="mt-5 font-semibold">You haven&apos;t placed any orders yet.</p>
      </section>
      <div className="my-8 border-t border-black/15" />
      <section>
        <h2 className="text-xl font-bold">Shipping Address</h2>
        <p className="mt-5 font-semibold">Türkiye</p>
        <button className="focus-ring mt-4 flex items-center gap-2 font-semibold">
          <ArrowRight size={16} />
          Edit Address
        </button>
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
      <h1 className="display text-4xl">Account</h1>
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

function Addresses() {
  return (
    <>
      <h1 className="display text-4xl">Addresses</h1>
      <section className="mt-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold">Default</h2>
            <p className="mt-5 font-semibold">Türkiye</p>
            <button className="focus-ring mt-4 flex items-center gap-2 font-semibold">
              <ArrowRight size={16} />
              Edit Address
            </button>
          </div>
          <button className="focus-ring mt-16 flex items-center gap-1 font-semibold">
            <X size={15} />
            Remove
          </button>
        </div>
      </section>
      <div className="my-10 border-t border-black/15" />
      <button className="focus-ring flex items-center gap-2 font-semibold">
        <Plus size={16} />
        Add New Address
      </button>
    </>
  );
}

function Orders() {
  return (
    <>
      <h1 className="display text-4xl">Order History</h1>
      <p className="mt-10 font-semibold">You haven&apos;t placed any orders yet.</p>
      <div className="mt-12 border-t border-black/15" />
    </>
  );
}
