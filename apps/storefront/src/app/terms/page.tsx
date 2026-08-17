import { InformationPage } from "@/components/layout/InformationPage";
import { storeInfo } from "@/lib/store-info";

export default function TermsPage() {
  return (
    <InformationPage
      eyebrow="Yasal"
      title="Kullanım koşulları"
      introduction={`Bu siteyi kullanarak ${storeInfo.brandName} mağazasının aşağıdaki kullanım koşullarını kabul etmiş olursunuz.`}
      sections={[
        {
          title: "Mağaza kullanımı",
          content: (
            <p>
              Hesap bilgilerinizin doğruluğundan ve güvenliğinden siz sorumlusunuz. Siteyi hukuka
              aykırı, yanıltıcı veya hizmetin çalışmasını bozacak biçimde kullanamazsınız.
            </p>
          ),
        },
        {
          title: "Ürün ve fiyatlar",
          content: (
            <p>
              Ürün görselleri ekran ayarlarına bağlı olarak küçük farklılık gösterebilir. Siparişe
              uygulanacak fiyat ve masraflar ödeme onayından önce açıkça gösterilir.
            </p>
          ),
        },
        {
          title: "Fikrî haklar",
          content: (
            <p>
              Sitedeki marka, tasarım, metin, fotoğraf ve diğer içerikler hak sahiplerinin izni
              olmadan ticari amaçla kopyalanamaz veya dağıtılamaz.
            </p>
          ),
        },
        {
          title: "Değişiklikler",
          content: (
            <p>
              Koşullar mevzuat veya hizmet değişikliklerine göre güncellenebilir. Güncel metin bu
              sayfada yayımlandığı tarihten itibaren geçerlidir.
            </p>
          ),
        },
      ]}
    />
  );
}
