"use client";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";

export function AccountAction() {
  const { user } = useAuth();
  return (
    <Link
      href={user ? "/account" : "/account/login"}
      className="focus-ring flex items-center gap-1 p-2"
      aria-label="Account"
    >
      <UserRound size={20} />
      <span className="hidden lg:inline">Account</span>
    </Link>
  );
}
