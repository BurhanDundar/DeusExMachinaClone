"use client";
import Link from "next/link";
import {Menu,Search,ShoppingBag,UserRound,X} from "lucide-react";
import {Brand} from "@/components/ui/Brand";
import {useUIStore} from "@/store/ui-store";
import {MobileMenu} from "./MobileMenu";

const nav=["Men","Women","Accessories","Culture","Sale"];
export function Header(){const s=useUIStore();const count=s.items.reduce((n,i)=>n+i.quantity,0);return <>
 <header className="sticky top-0 z-40 h-[88px] border-b border-black/5 bg-paper/95 backdrop-blur-md md:h-[96px]">
  <div className="shell relative flex h-full items-center justify-between">
   <nav className="hidden gap-7 lg:flex" aria-label="Primary">{nav.map(n=><Link className="focus-ring font-semibold" href={`/collections/${n.toLowerCase()}`} key={n}>{n} <span aria-hidden>＋</span></Link>)}</nav>
   <button onClick={s.toggleMenu} className="focus-ring justify-self-start p-2 lg:hidden" aria-label={s.menuOpen?"Close menu":"Open menu"}>{s.menuOpen?<X/>:<Menu/>}</button>
   <Link href="/" className="focus-ring absolute left-1/2 -translate-x-1/2"><Brand/></Link>
   <div className="fixed right-3 top-5 z-50 flex items-center gap-0 md:right-4 md:top-6 md:gap-5">
    <button onClick={s.openSearch} className="focus-ring flex items-center gap-1 p-2" aria-label="Search"><Search size={22}/><span className="hidden xl:inline">Search</span></button>
    <Link href="/account/login" className="focus-ring hidden items-center gap-1 lg:flex"><UserRound size={20}/> Account</Link>
    <button onClick={s.openCart} className="focus-ring relative flex items-center gap-1 p-2" aria-label={`Bag with ${count} items`}><ShoppingBag size={23}/><span className="hidden sm:inline">Bag ({count})</span><span className="absolute right-0 top-0 text-[10px] sm:hidden">{count}</span></button>
   </div>
  </div>
 </header><MobileMenu open={s.menuOpen} close={s.closeMenu}/></>}
