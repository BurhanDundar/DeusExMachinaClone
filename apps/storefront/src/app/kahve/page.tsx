import type { Metadata } from "next";
import { ThemePage } from "@/components/layout/ThemePage";
import { themes } from "@/data/themes";

export const metadata: Metadata = {
  title: "Kahve",
  description: "Binks Machina kahve kültürü ve günlük ritüeli.",
};

export default function CoffeePage() {
  return <ThemePage content={themes.kahve} />;
}
