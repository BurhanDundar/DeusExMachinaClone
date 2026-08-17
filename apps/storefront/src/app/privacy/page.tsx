import { InformationPage } from "@/components/layout/InformationPage";
import { storeInfo } from "@/lib/store-info";

export default function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="Yasal"
      title="Gizlilik politikası"
      introduction={`${storeInfo.legalName}, mağaza hizmetlerini sunarken paylaştığınız kişisel verileri yalnızca belirtilen amaçlar ve yürürlükteki mevzuat kapsamında işler.`}
      sections={[
        {
          title: "Toplanan veriler",
          content: (
            <p>
              Hesap ve sipariş işlemleri sırasında ad, soyad, iletişim, teslimat ve fatura
              bilgileri; güvenlik ve hizmet kalitesi için sınırlı teknik kayıtlar işlenebilir. Kart
              bilgileri mağaza sunucularında saklanmaz; ödeme kuruluşu tarafından işlenir.
            </p>
          ),
        },
        {
          title: "İşleme amaçları",
          content: (
            <p>
              Veriler; üyelik yönetimi, sipariş ve teslimat, müşteri desteği, sahteciliğin
              önlenmesi, yasal yükümlülükler ve açık rıza verilmişse pazarlama iletişimi için
              kullanılır.
            </p>
          ),
        },
        {
          title: "Paylaşım ve saklama",
          content: (
            <p>
              Veriler yalnızca hizmet için gerekli ölçüde ödeme, kargo, barındırma ve yetkili kamu
              kuruluşlarıyla paylaşılır; amaç ve yasal saklama süresi sona erdiğinde silinir veya
              anonimleştirilir.
            </p>
          ),
        },
        {
          title: "Haklarınız",
          content: (
            <p>
              KVKK kapsamındaki erişim, düzeltme, silme, itiraz ve bilgi taleplerinizi iletişim
              kanalımızdan iletebilirsiniz. Kimlik doğrulaması istenebilir.
            </p>
          ),
        },
      ]}
    />
  );
}
