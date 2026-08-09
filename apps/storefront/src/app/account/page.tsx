"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, X } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/auth/AuthProvider";

type AccountSection = "overview" | "details" | "addresses" | "orders";

const navigation: { id: AccountSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Account Details" },
  { id: "addresses", label: "Addresses" },
  { id: "orders", label: "Order History" },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
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
                <Details firstName={user.firstName} lastName={user.lastName} email={user.email} />
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
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  return (
    <>
      <h1 className="display text-4xl">Account</h1>
      <div className="mt-10 font-semibold">
        <p>
          {firstName} {lastName}
        </p>
        <p>{email}</p>
      </div>
      <button className="focus-ring mt-5 border-b border-dotted border-black font-semibold">
        Reset Password
      </button>
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
