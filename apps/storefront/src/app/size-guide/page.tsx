import { InformationPage } from "@/components/layout/InformationPage";

export default function SizeGuidePage() {
  return (
    <InformationPage
      eyebrow="Destek"
      title="Beden rehberi"
      introduction="En doğru seçim için vücut ölçünüzü değil, üzerinize iyi oturan benzer bir ürünü düz zeminde ölçüp ürün bilgileriyle karşılaştırın."
      sections={[
        {
          title: "Üst giyim",
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Göğüs: Koltuk altından koltuk altına düz ölçün ve ikiyle çarpın.</li>
              <li>Boy: Omuzun en yüksek noktasından etek ucuna kadar ölçün.</li>
              <li>Kol: Omuz dikişinden manşet ucuna kadar ölçün.</li>
            </ul>
          ),
        },
        {
          title: "Kalıp bilgisi",
          content: (
            <p>
              Ürüne özel kalıp veya ölçü bilgisi ürün detayında belirtilir. İki beden arasında
              kalırsanız daha rahat kullanım için büyük bedeni tercih edin.
            </p>
          ),
        },
        {
          title: "Yardım",
          content: (
            <p>Kararsız kaldığınızda boy, kilo ve tercih ettiğiniz kalıbı belirterek bize yazın.</p>
          ),
        },
      ]}
    />
  );
}
