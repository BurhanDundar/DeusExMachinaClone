import type { Metadata } from "next";
import { ThemePage } from "@/components/layout/ThemePage";
import { themes } from "@/data/themes";

export const metadata: Metadata = {
  title: "Dövme",
  description: "Binks Machina dövme stüdyosu, çizgi ve zanaat kültürü.",
};

export default function TattooPage() {
  return <ThemePage content={themes.dovme} />;
}
