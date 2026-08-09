export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`display text-[24px] md:text-[30px] tracking-[-.07em] ${light ? "text-white" : "text-ink"}`}
    >
      NORTHLINE®
    </span>
  );
}
