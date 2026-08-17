import { InformationPage } from "@/components/layout/InformationPage";
import { storeInfo } from "@/lib/store-info";

export default function ContactPage() {
  const email = storeInfo.supportEmail;
  return (
    <InformationPage
      eyebrow="Destek"
      title="İletişim"
      introduction="Ürünler, siparişler, teslimat ve iadeler hakkında bize ulaşabilirsiniz. Mesajlara iş günlerinde mümkün olan en kısa sürede yanıt veriyoruz."
      sections={[
        {
          title: "E-posta",
          content: email ? (
            <p>
              <a className="font-bold underline" href={`mailto:${email}`}>
                {email}
              </a>
            </p>
          ) : (
            <p>
              Destek adresi henüz tanımlanmadı. Yönetici, Vercel ortamına
              <code className="mx-1 bg-black/5 px-1">NEXT_PUBLIC_SUPPORT_EMAIL</code> eklemelidir.
            </p>
          ),
        },
        {
          title: "Telefon",
          content: <p>{storeInfo.phone || "Telefon desteği henüz tanımlanmadı."}</p>,
        },
        {
          title: "Adres",
          content: <p>{storeInfo.address || "Mağaza adresi henüz tanımlanmadı."}</p>,
        },
      ]}
    />
  );
}
