import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <main>
      <article className="shell mx-auto max-w-[1440px] py-16 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-black/55">
          Northline Supply
        </p>
        <h1 className="display mt-5 text-5xl md:text-7xl">Hakkımızda</h1>
        <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-[500px]">
            <Eyebrow number="01" title="Biz Kimiz?" />
            <div className="mt-6 space-y-5 leading-6">
              <p>
                Bazen en iyi hikâyeler, kalplere sığmayan tutkuların yollarını birleştirmesiyle
                başlar. Biz de tam olarak bunu yaptık; sevdiğimiz farklı dünyaları aynı çatı altında
                harmanladık. Ortaya sade bir işletmeden çok daha fazlası, kendine has bir yaşam
                biçimi çıktı.
              </p>
              <p>
                Dövme stüdyosunun zanaatını, kahvenin taze kokusunu ve motosiklet tutkusunun özgür
                ruhunu bir arada yaşatıyoruz. Burası; kahvenin yoğun aromasının motor sesleriyle
                yankılandığı, derinin, metalin ve çizginin ruhunun karıştığı bir buluşma noktasıdır.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <figure className="relative aspect-[4/5] overflow-hidden bg-fog">
              <Image
                src="/campaign/campaign-portrait.jpg"
                alt="Northline topluluğu"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 45vw, 320px"
              />
            </figure>
            <figure className="relative aspect-[4/5] overflow-hidden bg-fog">
              <Image
                src="/campaign/campaign-portrait.png"
                alt="Northline tarzı"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 45vw, 320px"
              />
            </figure>
          </div>
        </section>
        <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <figure className="relative aspect-[16/10] overflow-hidden bg-fog">
            <Image
              src="/campaign/campaign-wide.jpg"
              alt="Northline yolda"
              fill
              className="object-cover"
              sizes="(max-width: 1023px) 100vw, 650px"
            />
          </figure>
          <div className="max-w-[500px]">
            <Eyebrow number="02" title="Yolumuz Nereye Çıkıyor?" />
            <div className="mt-6 space-y-5 leading-6">
              <p>
                Aynı çatı altında başlayan bu serüven şimdi sokaklara, yollara ve üzerimizdeki
                kıyafetlere taşıyor. Tasarım tutkumuzu; yollarda ve garajlarda konfor arayanlar için
                hazırladığımız motorcu dostu ürünlerden, günlük hayata sızan rafine yaşam stilimize
                kadar uzatıyoruz.
              </p>
              <p>
                Her bir çizgide, her bir dikişte ve her bir tasarımda kendi ellerimizin izi, kendi
                tarzımızın karakteri var. Aslında rüzgâr hissedenlerin, kahvesini sert ve sade
                sevenlerin, temize ve stille kalıcı bir imza atmak isteyenlerin yerindeyiz.
              </p>
            </div>
            <blockquote className="mt-8 border-l-2 border-acid bg-fog px-5 py-4 italic leading-6">
              Motorun sesine, kahvenin kokusuna, tasarımın gücüne ve sanatın kalbine kulak veren
              herkesi bu yola bekliyoruz.
            </blockquote>
          </div>
        </section>
      </article>
      <Footer />
    </main>
  );
}

function Eyebrow({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-sm font-bold text-black/55">{number}</span>
      <h2 className="display text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}
