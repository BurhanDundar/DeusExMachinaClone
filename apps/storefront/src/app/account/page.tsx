"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/auth/AuthProvider";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  useEffect(() => { if (!loading && !user) router.replace("/account/login"); }, [loading, user, router]);
  if (loading || !user) return <main className="min-h-[60vh] px-5 py-20">Loading account…</main>;
  return <main className="shell min-h-[70vh] py-16">
    <p className="text-sm uppercase tracking-[.16em]">Your account</p>
    <h1 className="display mt-3 text-5xl md:text-7xl">Hello, {user.firstName}</h1>
    <div className="mt-12 grid gap-4 md:grid-cols-2">
      <section className="border border-black p-6"><h2 className="display text-2xl">Profile</h2><p className="mt-5">{user.firstName} {user.lastName}</p><p className="mt-1 text-black/60">{user.email}</p></section>
      <section className="border border-black p-6"><h2 className="display text-2xl">Orders</h2><p className="mt-5 text-black/60">Order history arrives in the orders milestone.</p><Link href="#" className="mt-5 inline-block font-bold underline">View orders</Link></section>
    </div>
    <button onClick={async()=>{await logout();router.replace("/")}} className="mt-8 border border-black px-6 py-3 font-bold">Log out</button>
  </main>;
}
