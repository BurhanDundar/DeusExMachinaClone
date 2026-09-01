"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, UserRound, X } from "lucide-react";
import { aboutLinks, catalogLinks, supportLinks, type NavigationLink } from "@/data/navigation";

export function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.22 }}
          className="fixed inset-y-0 left-0 z-[60] flex w-[calc(100%-18px)] max-w-[360px] flex-col bg-paper px-6 py-5 shadow-2xl lg:hidden"
          aria-label="Menü"
        >
          <div className="flex h-12 items-start justify-between">
            <div className="size-12" aria-hidden="true">
              <Image
                src="/logo/seytan.png"
                alt=""
                width={48}
                height={48}
                className="size-12 object-contain"
                style={{ transform: "scaleX(-1)" }}
                sizes="48px"
              />
            </div>
            <button
              onClick={close}
              className="focus-ring grid size-9 place-items-center border border-black/15"
              aria-label="Menüyü kapat"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="mt-12" aria-label="Mobil menü">
            <ul className="space-y-1">
              {catalogLinks.map((category) => (
                <li key={category.href}>
                  <Link
                    onClick={close}
                    href={category.href}
                    className="focus-ring flex items-center gap-1 py-1 text-base font-semibold"
                  >
                    {category.label}
                    <ArrowRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="my-7 border-t border-black/15" />
            <MenuGroup title="Destek" links={supportLinks} close={close} />
            <MenuGroup title="Hakkımızda" links={aboutLinks} close={close} />
          </nav>
          <div className="mt-auto flex items-center justify-between border-t border-black/15 pt-5 text-sm">
            <button className="focus-ring border border-black/20 px-3 py-2">TR</button>
            <Link onClick={close} href="/account" className="focus-ring flex items-center gap-1">
              <UserRound size={15} />
              Hesabım
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function MenuGroup({
  title,
  links,
  close,
}: {
  title: string;
  links: NavigationLink[];
  close: () => void;
}) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-sm font-bold">{title}</h2>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link onClick={close} href={link.href} className="focus-ring block py-0.5 text-sm">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
