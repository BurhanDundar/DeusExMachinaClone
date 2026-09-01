import type { Metadata } from "next";
import { ThemePage } from "@/components/layout/ThemePage";
import { themes } from "@/data/themes";

export const metadata: Metadata = {
  title: "Motor",
  description: "Binks Machina motosiklet, yol ve garaj kültürü.",
};

export default function MotorcyclePage() {
  return <ThemePage content={themes.motor} />;
}
