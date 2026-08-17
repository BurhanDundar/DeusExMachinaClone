import Link from "next/link";
import { Globe2 } from "lucide-react";
import { Newsletter } from "@/components/home/Newsletter";
const groups = [
  { title: "Destek", links: ["İletişim", "Kargo", "İade", "Beden rehberi"] },
  { title: "Hakkımızda", links: ["Marka hakkında"] },
  { title: "Sosyal medya", links: ["Instagram", "YouTube", "Facebook"] },
];
export function Footer() {
  return (
    <footer>
      <Newsletter />
      <div className="grid gap-10 bg-[#e6e5e1] px-6 pb-10 md:grid-cols-4 md:px-12 md:pb-14">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-lg font-bold">{group.title}</h3>
            <ul className="space-y-2">
              {group.links.map((x) => (
                <li key={x}>
                  <Link href={x === "Marka hakkında" ? "/about" : "#"} className="focus-ring">
                    {x}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="mb-4 text-lg font-bold">Bölge</h3>
          <button className="focus-ring flex items-center gap-2 border border-black px-4 py-3">
            <Globe2 /> TL / TR
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-[#e6e5e1] px-6 pb-8 text-xs md:flex-row md:justify-between md:px-12">
        <span>© 2026 Northline Supply. Tüm hakları saklıdır.</span>
        <span>Gizlilik · Koşullar</span>
      </div>
    </footer>
  );
}
