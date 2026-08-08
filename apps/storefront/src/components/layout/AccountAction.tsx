"use client";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";

export function AccountAction() {
  const { user, loading } = useAuth();
  return <Link href={user ? "/account" : "/account/login"} className="focus-ring hidden items-center gap-1 lg:flex">
    <UserRound size={20}/>{loading ? "Account" : user?.firstName ?? "Account"}
  </Link>;
}
