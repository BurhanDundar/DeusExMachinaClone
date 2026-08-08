"use client";
import Image from "next/image";import Link from "next/link";import {Plus} from "lucide-react";import {useState} from "react";import {useUIStore} from "@/store/ui-store";import type {Product} from "@/data/products";
export function ProductCard({product}:{product:Product}){const [sizes,setSizes]=useState(false);const add=useUIStore(s=>s.add);return <article className="group min-w-0">
 <Link href={`/products/${product.slug}`} className="focus-ring relative block aspect-[4/5] overflow-hidden bg-[#f0f0ed]">
  <span className="absolute left-3 top-3 z-10 bg-paper px-1 text-xs font-bold">{product.badge}</span>
  <Image src={product.images[0]} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-[1.02] group-hover:opacity-0" sizes="(max-width:767px) 50vw,25vw"/>
  <Image src={product.images[1]} alt="" fill className="object-cover opacity-0 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100" sizes="(max-width:767px) 50vw,25vw"/>
 </Link>
 <div className="relative min-h-[108px] pt-4 pr-10 text-[13px] md:text-sm"><h3 className="font-bold">{product.name}</h3><p className="mt-1">€{product.price.toFixed(2)} EUR {product.originalPrice&&<s className="ml-1 text-black/40">€{product.originalPrice.toFixed(2)}</s>}</p><p className="mt-3 font-semibold">{product.color} <span className="text-black/35">+ {product.colors.length} styles</span></p>
 {product.inventoryStatus!=="sold-out"&&<button onClick={()=>setSizes(v=>!v)} aria-label={`Quick add ${product.name}`} className="focus-ring absolute right-0 top-3 p-2"><Plus/></button>}
 {sizes&&<div className="absolute inset-x-0 top-12 z-10 flex flex-wrap gap-1 bg-paper py-2">{product.availableSizes.map(size=><button key={size} onClick={()=>{add(product,size);setSizes(false)}} className="focus-ring border border-black px-2 py-1 text-xs hover:bg-black hover:text-white">{size}</button>)}</div>}</div>
 </article>}
