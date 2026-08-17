import { InformationPage } from "@/components/layout/InformationPage";

export default function ShippingPage() {
  return (
    <InformationPage
      eyebrow="Destek"
      title="Kargo ve teslimat"
      introduction="Siparişiniz hazırlanıp kargoya verildiğinde takip bilgileri kayıtlı e-posta adresinize iletilir."
      sections={[
        {
          title: "Hazırlık süresi",
          content: <p>Siparişler iş günlerinde genellikle 1–3 iş günü içinde hazırlanır.</p>,
        },
        {
          title: "Teslimat",
          content: (
            <p>
              Türkiye içi teslimatlar kargo firmasına ve adrese bağlı olarak genellikle 1–5 iş günü
              sürer. Resmî tatiller ve yoğun kampanya dönemleri süreyi uzatabilir.
            </p>
          ),
        },
        {
          title: "Hasarlı paket",
          content: (
            <p>
              Pakette görünür hasar varsa teslimat sırasında tutanak tutturun ve ürün ile ambalajın
              fotoğraflarıyla birlikte iletişim sayfasından bize ulaşın.
            </p>
          ),
        },
      ]}
    />
  );
}
