export const storeInfo = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "Binks Machina",
  legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME?.trim() || "Binks Machina",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() || "",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE?.trim() || "",
  taxOffice: process.env.NEXT_PUBLIC_COMPANY_TAX_OFFICE?.trim() || "",
  taxNumber: process.env.NEXT_PUBLIC_COMPANY_TAX_NUMBER?.trim() || "",
};
