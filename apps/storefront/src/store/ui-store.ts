"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartLine={product:Product;size:string;quantity:number};
type State={cartOpen:boolean;searchOpen:boolean;menuOpen:boolean;items:CartLine[];openCart:()=>void;closeCart:()=>void;openSearch:()=>void;closeSearch:()=>void;toggleMenu:()=>void;closeMenu:()=>void;add:(product:Product,size:string)=>void;remove:(id:string,size:string)=>void;quantity:(id:string,size:string,value:number)=>void};
export const useUIStore=create<State>()(persist((set)=>({cartOpen:false,searchOpen:false,menuOpen:false,items:[],openCart:()=>set({cartOpen:true}),closeCart:()=>set({cartOpen:false}),openSearch:()=>set({searchOpen:true}),closeSearch:()=>set({searchOpen:false}),toggleMenu:()=>set(s=>({menuOpen:!s.menuOpen})),closeMenu:()=>set({menuOpen:false}),add:(product,size)=>set(s=>{const hit=s.items.find(i=>i.product.id===product.id&&i.size===size);return {cartOpen:true,items:hit?s.items.map(i=>i===hit?{...i,quantity:i.quantity+1}:i):[...s.items,{product,size,quantity:1}]}}),remove:(id,size)=>set(s=>({items:s.items.filter(i=>i.product.id!==id||i.size!==size)})),quantity:(id,size,value)=>set(s=>({items:s.items.map(i=>i.product.id===id&&i.size===size?{...i,quantity:Math.max(1,value)}:i)}))}),{name:"northline-cart",partialize:s=>({items:s.items})}));
