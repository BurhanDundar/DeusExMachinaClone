export const CURRENCY_CODE = "TRY";
export const CURRENCY_LABEL = "TL";

const formatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: CURRENCY_CODE,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number) {
  return formatter.format(amount);
}
