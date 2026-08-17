import { InformationPage } from "@/components/layout/InformationPage";
import { storeInfo } from "@/lib/store-info";

function sellerDetails() {
  const details = [
    storeInfo.legalName,
    storeInfo.address,
    storeInfo.phone,
    storeInfo.supportEmail,
    [storeInfo.taxOffice, storeInfo.taxNumber].filter(Boolean).join(" / "),
  ].filter(Boolean);
  return details.length > 1
    ? details.join(" · ")
    : "Satıcı bilgileri ödeme öncesinde tamamlanmalıdır.";
}

export default function DistanceSalesPage() {
  return (
    <InformationPage
      eyebrow="Yasal"
      title="Mesafeli satış sözleşmesi"
      introduction="Bu metin, elektronik ortamda kurulan satış sözleşmesinin genel çerçevesidir. Siparişe özel ürün, alıcı, toplam tutar ve teslimat bilgileri ödeme onayından önce ayrıca gösterilir."
      sections={[
        { title: "Satıcı", content: <p>{sellerDetails()}</p> },
        {
          title: "Sözleşmenin konusu",
          content: (
            <p>
              Alıcının elektronik ortamda seçtiği ürünlerin satışı, bedelinin ödenmesi, teslimatı,
              cayma hakkı ve tarafların karşılıklı hak ve yükümlülükleridir.
            </p>
          ),
        },
        {
          title: "Ödeme ve teslimat",
          content: (
            <p>
              Ürün bedeli, vergi, kargo ve varsa indirimler sipariş özeti içinde gösterilir.
              Teslimat, alıcının bildirdiği adrese yasal azami süre aşılmadan gerçekleştirilir.
            </p>
          ),
        },
        {
          title: "Cayma hakkı",
          content: (
            <p>
              Alıcı, mevzuattaki istisnalar saklı olmak üzere teslimden itibaren 14 gün içinde
              gerekçe göstermeden cayabilir. Kullanım için gerekli incelemeyi aşan değer kaybından
              alıcı sorumlu olabilir.
            </p>
          ),
        },
        {
          title: "Uyuşmazlık",
          content: (
            <p>
              Uyuşmazlıklarda yürürlükteki parasal sınırlar dâhilinde tüketici hakem heyetleri ve
              tüketici mahkemeleri yetkilidir.
            </p>
          ),
        },
      ]}
    />
  );
}
