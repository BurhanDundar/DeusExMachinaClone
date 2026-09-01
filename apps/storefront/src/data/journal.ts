import { cultureMedia } from "@/data/culture-media";

export type JournalArticle = {
  slug: string;
  theme: string;
  title: string;
  cardDescription: string;
  date: string;
  excerpt: string;
  lead: string;
  image: string;
  imagePosition: string;
  accent: string;
  quote: string;
  sections: Array<{ number: string; title: string; body: string }>;
  gallery: Array<{ src: string; alt: string; position?: string }>;
  video?: { src: string; poster: string; caption: string };
};

export const articles: JournalArticle[] = [
  {
    slug: "kavrulmus-notlar",
    theme: "Kahve günlüğü",
    title: "Kavrulmuş Notlar",
    cardDescription: "Kahve ve ortak alan deneyimi",
    date: "24 Ağustos 2026",
    excerpt: "Bir fincanın arkasındaki denemeler, sabah ritüelleri ve atölye sohbetleri.",
    lead:
      "Kahveyi menüye eklemek kolaydı; ona bize ait bir karakter vermek zaman aldı. Bu hikâye, tadım masasındaki ilk kararsızlıktan herkesin kendi fincanını bulduğu güne kadar tuttuğumuz notlardan oluşuyor.",
    image: cultureMedia.kahve.pourOver,
    imagePosition: "center",
    accent: "#d7ff38",
    quote: "İyi bir fikir bazen motor sesiyle değil, öğütücünün ilk sesiyle başlıyor.",
    sections: [
      {
        number: "01",
        title: "İlk demleme",
        body: "Gramları, sıcaklığı ve süreyi değiştirerek mekânın sabah ritmini bulduk.",
      },
      {
        number: "02",
        title: "Ortak masa",
        body: "Tadım masası kısa sürede çizimlerin ve rota sohbetlerinin ortak masasına dönüştü.",
      },
      {
        number: "03",
        title: "Her gün yeniden",
        body: "Her gün ölçüyor, tadıyor ve küçük ayarlarla aynı karakteri yeniden arıyoruz.",
      },
    ],
    gallery: [
      {
        src: cultureMedia.kahve.espresso,
        alt: "Espresso hazırlanırken",
      },
      {
        src: cultureMedia.kahve.steam,
        alt: "Kahve hazırlığından buharlı bir detay",
      },
      {
        src: cultureMedia.kahve.barista,
        alt: "Barista tezgâh başında",
      },
      {
        src: cultureMedia.kahve.window,
        alt: "Kahve dükkânının camından bir kare",
      },
      {
        src: cultureMedia.kahve.hero,
        alt: "Kahve mekânından içeriye bakış",
      },
      {
        src: cultureMedia.kahve.pourOver,
        alt: "Pour-over demleme ritüeli",
      },
    ],
  },
  {
    slug: "ignenin-hafizasi",
    theme: "Dövme günlüğü",
    title: "İğnenin Hafızası",
    cardDescription: "Dövme fikrinden uygulamaya uzanan süreç",
    date: "12 Ağustos 2026",
    excerpt: "Bir fikrin eskizden tene geçerken değiştirdiği biçimler ve bize öğrettikleri.",
    lead:
      "Her çizim kâğıt üzerinde tamamlanmış görünür; tenle buluştuğunda yeniden yaşamaya başlar. Bu sayfalar, ilk konuşmadan son kontrole kadar verdiğimiz kararları ve her işten geriye kalan küçük dersleri anlatıyor.",
    image: cultureMedia.dovme.session,
    imagePosition: "center",
    accent: "#ff4b36",
    quote: "Çizgiyi kalıcı yapan mürekkep değil, arkasındaki hikaye.",
    sections: [
      {
        number: "01",
        title: "Dinlemek",
        body: "İlk çizgiden önce referansların ardındaki duyguyu dinledik.",
      },
      {
        number: "02",
        title: "Çizgiyi aramak",
        body: "Farklı kalınlık ve yerleşimleri deneyerek çizginin bedenle nasıl hareket ettiğini gördük.",
      },
      {
        number: "03",
        title: "Sonrası",
        body: "İyileşme sürecini takip etmek, uygulama kadar önemli bir parçamız oldu.",
      },
    ],
    gallery: [
      {
        src: cultureMedia.dovme.studio,
        alt: "Dövme stüdyosunun çalışma alanı",
      },
      {
        src: cultureMedia.dovme.color,
        alt: "Renkli dövme çalışması",
      },
      {
        src: cultureMedia.dovme.artwork,
        alt: "Tamamlanmış dövme detayı",
      },
      {
        src: cultureMedia.dovme.portrait,
        alt: "Stüdyodan portre ve dövme detayı",
      },
      {
        src: cultureMedia.dovme.hero,
        alt: "Dövme uygulama sürecinden bir kare",
      },
      {
        src: cultureMedia.dovme.session,
        alt: "Sanatçı ve müşteri uygulama sırasında",
      },
    ],
  },
  {
    slug: "kontak-acik",
    theme: "Yol günlüğü",
    title: "Kontak Açık",
    cardDescription: "Motor, garaj ve yol deneyimleri",
    date: "3 Ağustos 2026",
    excerpt: "Garajda başlayan, şehir sınırının dışında tamamlanan bir yol günlüğü.",
    lead:
      "Plan basitti: gün doğmadan buluşmak ve yol nereye götürürse oraya gitmek. Fakat her yolculuk gibi bu da makineyi, ekipmanı ve birlikte hareket etmenin ne demek olduğunu yeniden düşünmemize neden oldu.",
    image: cultureMedia.motor.road,
    imagePosition: "center 58%",
    accent: "#63d4ff",
    quote: "Yolun en iyi kısmı, haritadaki çizginin bittiği yerde başlar.",
    sections: [
      {
        number: "01",
        title: "Garaj saati",
        body: "Lastik, zincir, yakıt ve son bir kahve: yol garajdaki sessizlikte başladı.",
      },
      {
        number: "02",
        title: "Şehir çizgisi",
        body: "Trafik geride kalınca hız değil, aynı ritimde hareket etmek önem kazandı.",
      },
      {
        number: "03",
        title: "Dönüş yolu",
        body: "Dönüşte kilometreyi değil, yolda neyin gerçekten işe yaradığını konuştuk.",
      },
    ],
    gallery: [
      {
        src: cultureMedia.motor.hero,
        alt: "Dağ yolunda iki motosiklet",
        position: "center",
      },
      {
        src: cultureMedia.motor.lineup,
        alt: "Buluşma noktasında sıralanan motosikletler",
      },
      {
        src: cultureMedia.motor.cafe,
        alt: "Kahve ve motor buluşma noktası",
      },
      {
        src: cultureMedia.motor.helmets,
        alt: "Sürüş öncesi kasklar ve motosikletler",
      },
      {
        src: cultureMedia.motor.lake,
        alt: "Göl kıyısındaki yol molası",
      },
      {
        src: cultureMedia.motor.detail,
        alt: "Kask, çay ve yol molası",
      },
    ],
  },
];
