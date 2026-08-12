import Image from "next/image";

export function Brand() {
  return (
    <Image
      src="/logo/binks-machina-logo.png"
      alt="Binks Machina"
      width={212}
      height={79}
      priority
      sizes="(max-width: 640px) 170px, 212px"
      className="h-auto w-[170px] translate-y-1 sm:w-[190px] md:w-[212px]"
    />
  );
}
