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
    image: "/products/binks/atolye-seti.jpeg",
    imagePosition: "center 68%",
    accent: "#d7ff38",
    quote: "İyi bir fikir bazen motor sesiyle değil, öğütücünün ilk sesiyle başlıyor.",
    sections: [
      {
        number: "01",
        title: "İlk demleme",
        body: "İlk reçetelerimiz fazla sertti. Sonra kahvenin gücünü yoğunluktan değil, dengeden aldığını fark ettik. Gramları, sıcaklığı ve süreyi tekrar tekrar değiştirirken aslında mekânın sabah ritmini de kuruyorduk.",
      },
      {
        number: "02",
        title: "Ortak masa",
        body: "Tadımlar kısa sürede ekip toplantılarına, çizim seanslarına ve rota konuşmalarına dönüştü. Kahve barı ayrı bir bölüm olmaktan çıktı; atölyenin herkesle kesişen merkezi oldu.",
      },
      {
        number: "03",
        title: "Her gün yeniden",
        body: "Aynı çekirdek her gün aynı davranmıyor. Biz de ölçüyor, tadıyor ve küçük ayarlar yapıyoruz. Tutarlılığın ezberden değil, dikkat göstermekten geldiğini burada öğrendik.",
      },
    ],
    gallery: [
      {
        src: "/products/binks/gomlek-fume-is.jpeg",
        alt: "Binks Machina atölye masası",
      },
      {
        src: "/products/binks/defter-ilk-seri.jpeg",
        alt: "Atölyede tutulan kahve ve tasarım notları",
      },
      {
        src: "/products/binks/koleksiyon-seti.jpeg",
        alt: "Atölye günlüğünden bir detay",
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
    image: "/products/binks/bandana-dovme-makinesi.jpeg",
    imagePosition: "center",
    accent: "#ff4b36",
    quote: "Çizgiyi kalıcı yapan mürekkep değil, arkasındaki niyet.",
    sections: [
      {
        number: "01",
        title: "Dinlemek",
        body: "İyi bir tasarım çizimle değil, doğru soruyla başladı. İnsanların taşıdığı referansların ardındaki duyguyu anlamaya çalıştık; bazen ilk fikirden vazgeçmek sürecin en doğru kararı oldu.",
      },
      {
        number: "02",
        title: "Çizgiyi aramak",
        body: "Yerleşim denemeleri, farklı kalınlıklar ve tekrar tekrar basılan şablonlar… Kâğıtta güçlü duran bir ayrıntının hareket eden bedende nasıl değiştiğini her provada yeniden gördük.",
      },
      {
        number: "03",
        title: "Sonrası",
        body: "Uygulama bittiğinde hikâye bitmiyor. İyileşme sürecini takip etmek ve yıllar sonra hâlâ güçlü kalacak bir iş üretmek, stüdyodaki bütün kararlarımızı etkiliyor.",
      },
    ],
    gallery: [
      {
        src: "/products/binks/atolye-seti.jpeg",
        alt: "Dövme makinesi çizimlerinin yer aldığı atölye seti",
      },
      {
        src: "/products/binks/tisort-mekanik-sanat.jpeg",
        alt: "Mekanik dövme çizgilerinden ilham alan çalışma",
      },
      {
        src: "/products/binks/bandana-paisley-koleksiyonu-detay.jpeg",
        alt: "Desen ve çizgi detayları",
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
    image: "/campaign/campaign-portrait.png",
    imagePosition: "center 22%",
    accent: "#63d4ff",
    quote: "Yolun en iyi kısmı, haritadaki çizginin bittiği yerde başladı.",
    sections: [
      {
        number: "01",
        title: "Garaj saati",
        body: "Sürüşten önceki sessizlik hep aynı: lastik basıncı, zincir, yakıt ve son bir kahve. Yolda sorun çıkarmayan her ayrıntının arkasında garajda geçirilen sabırlı bir saat olduğunu tekrar hatırladık.",
      },
      {
        number: "02",
        title: "Şehir çizgisi",
        body: "Trafik geride kalınca hızdan çok ritim önem kazandı. Rüzgâr, yol yüzeyi ve öndeki sürücünün hareketleri aynı dilin parçaları oldu; ekip olmanın konuşmadan da mümkün olduğunu gördük.",
      },
      {
        number: "03",
        title: "Dönüş yolu",
        body: "Eve dönerken not aldığımız ilk şey kilometre değildi. Hangi parça işe yaradı, hangi cep yanlış yerdeydi, neyi daha sade yapabilirdik? Yeni ürünlerin bir kısmı tam olarak bu dönüş konuşmalarından doğdu.",
      },
    ],
    gallery: [
      {
        src: "/campaign/campaign-wide.png",
        alt: "Yağmurlu yolda Binks Machina",
        position: "68% center",
      },
      {
        src: "/products/binks/sapka-motor-nakis.jpeg",
        alt: "Motor nakışı ve yol ekipmanı detayı",
      },
      {
        src: "/products/binks/defter-ilk-seri.jpeg",
        alt: "Yolculuktan ilham alan mekanik çizimler",
      },
    ],
  },
];
