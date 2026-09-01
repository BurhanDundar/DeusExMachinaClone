import type { ThemePageContent } from "@/components/layout/ThemePage";
import { cultureMedia } from "@/data/culture-media";

export const themes = {
  kahve: {
    slug: "kahve",
    index: "01",
    eyebrow: "Kahve / Günlük ritüel",
    title: "Kahve",
    statement: "Günün gürültüsü başlamadan önce, kendine ait birkaç iyi dakika.",
    introduction:
      "Bizim için kahve bir mola değil; sohbeti başlatan, fikirleri bir araya getiren ve atölyenin ritmini kuran günlük bir ritüel.",
    accent: "#d7ff38",
    surface: "#f1eee7",
    heroImage: cultureMedia.kahve.hero,
    heroPosition: "center 46%",
    detailImage: cultureMedia.kahve.espresso,
    detailPosition: "center",
    quote: "İyi kahve aceleye gelmez. İyi sohbet de öyle.",
    sections: [
      {
        number: "01",
        title: "Çekirdekten fincana",
        body: "Her fincanda dengeli, temiz ve karakterli bir tat arıyoruz. Seçtiğimiz çekirdekleri reçetesine sadık kalarak hazırlıyor; küçük ayrıntıların büyük fark yarattığına inanıyoruz.",
      },
      {
        number: "02",
        title: "Atölyenin ritmi",
        body: "Kahve barımız yalnızca sipariş verilen bir köşe değil. Yeni rotaların konuşulduğu, çizimlerin masaya yayıldığı ve topluluğun birbirini bulduğu ortak alanımız.",
      },
      {
        number: "03",
        title: "Sade ve gerçek",
        body: "Gösterişten uzak, malzemeye saygılı ve her gün aynı özenle hazırlanan bir deneyim. Tıpkı ürettiğimiz diğer her şey gibi: dürüst, sağlam ve kendine özgü.",
      },
    ],
  },
  dovme: {
    slug: "dovme",
    index: "02",
    eyebrow: "Dövme / Kalıcı ifade",
    title: "Dövme",
    statement: "Ten, hikâyenin yüzeyi. Çizgi ise anlatmak istediğin ne varsa onun izi.",
    introduction:
      "Her dövmeyi hazır bir görsel değil, birlikte geliştirilen kişisel bir iş olarak görüyoruz. Fikirden çizgiye, çizgiden tene uzanan süreçte zanaat hep merkezde.",
    accent: "#ff4b36",
    surface: "#eeeae5",
    heroImage: cultureMedia.dovme.session,
    heroPosition: "center",
    detailImage: cultureMedia.dovme.artwork,
    detailPosition: "center",
    quote: "İyi bir çizgi yalnızca görünmez; sahibine ait bir şey söyler.",
    sections: [
      {
        number: "01",
        title: "Fikir ve çizgi",
        body: "Süreç dinlemekle başlar. Anlatmak istediğin hikâyeyi, referansları ve yerleşimi birlikte konuşur; karakterini taşıyan özgün bir kompozisyona dönüştürürüz.",
      },
      {
        number: "02",
        title: "Zanaat ve hijyen",
        body: "Teknik hassasiyet kadar güvenli çalışma düzeni de vazgeçilmezimiz. Stüdyoda her uygulama profesyonel ekipman, steril süreç ve açık iletişimle ilerler.",
      },
      {
        number: "03",
        title: "Zamana kalan",
        body: "Trendlerin peşinden koşmak yerine yıllar sonra da sana ait hissettirecek işler üretiriz. Kalıcı bir işin kararına, uygulamasına ve bakımına aynı özeni gösteririz.",
      },
    ],
  },
  motor: {
    slug: "motor",
    index: "03",
    eyebrow: "Motor / Yolda olma hâli",
    title: "Motor",
    statement: "Varış noktası bahanedir. Asıl mesele makineyle, yolla ve kendinle kurduğun bağdır.",
    introduction:
      "Motosiklet bizim için bir ulaşım aracı değil; özgürlük, mekanik merak ve ortak bir dil. Garajdan sokağa uzanan kültürü birlikte yaşatıyoruz.",
    accent: "#63d4ff",
    surface: "#e9ecec",
    heroImage: cultureMedia.motor.lineup,
    heroPosition: "center 62%",
    detailImage: cultureMedia.motor.lake,
    detailPosition: "center 62%",
    quote: "Bazı yollar haritada değil, kontağı çevirdiğin anda başlar.",
    sections: [
      {
        number: "01",
        title: "Makine ve karakter",
        body: "Her motosiklet sahibinin izini taşır. Mekanik ayrıntılara, yaşanmış yüzeylere ve işlevsel tasarıma duyduğumuz ilgi ürettiğimiz her parçaya yansır.",
      },
      {
        number: "02",
        title: "Yol arkadaşlığı",
        body: "Rota uzun ya da kısa olabilir; önemli olan aynı tutkuyu paylaşan insanlarla yola çıkmak. Binks, garaj sohbetlerinden hafta sonu sürüşlerine uzanan bir buluşma noktasıdır.",
      },
      {
        number: "03",
        title: "Hareket için tasarım",
        body: "Koleksiyonlarımızı hareket hâlindeki hayatın ihtiyaçlarıyla düşünürüz: dayanıklı malzeme, rahat kalıp ve motordan indiğinde de karakterini koruyan yalın bir stil.",
      },
    ],
  },
} satisfies Record<string, ThemePageContent>;
