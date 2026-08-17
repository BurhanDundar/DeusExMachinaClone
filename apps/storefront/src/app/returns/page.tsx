import { InformationPage } from "@/components/layout/InformationPage";

export default function ReturnsPage() {
  return (
    <InformationPage
      eyebrow="Destek"
      title="İade ve değişim"
      introduction="Teslim aldığınız ürünü, aşağıdaki koşullara uygun olması hâlinde yasal cayma süresi içinde iade edebilirsiniz."
      sections={[
        {
          title: "Cayma süresi",
          content: (
            <p>
              Ürünü teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı
              kullanabilirsiniz. Talebinizi göndermeden ürünü kargolamayın; iade yönlendirmesi
              iletişim sırasında paylaşılır.
            </p>
          ),
        },
        {
          title: "Ürün koşulları",
          content: (
            <p>
              Ürün kullanılmamış, yıkanmamış, etiketi ve yeniden satılabilir niteliği korunmuş
              olmalıdır. Hijyen veya kişiye özel üretim kapsamındaki ürünlerde mevzuattaki
              istisnalar uygulanır.
            </p>
          ),
        },
        {
          title: "Geri ödeme",
          content: (
            <p>
              İade kontrolü tamamlandıktan sonra ödeme, alışverişte kullanılan yönteme yasal süreler
              içinde geri aktarılır. Bankanın hesaba yansıtma süresi ayrıca değişebilir.
            </p>
          ),
        },
      ]}
    />
  );
}
