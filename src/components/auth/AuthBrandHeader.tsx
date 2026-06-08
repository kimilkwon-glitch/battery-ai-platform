import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand-assets";

type Props = {
  tagline: string;
};

export function AuthBrandHeader({ tagline }: Props) {
  return (
    <header className="bm-auth-brand text-center">
      <Link href="/" className="bm-auth-brand__link inline-flex flex-col items-center gap-3">
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_LOGO_ALT}
          width={72}
          height={72}
          className="bm-auth-brand__logo h-[4.5rem] w-auto"
          sizes="72px"
          priority
          unoptimized
        />
        <span className="text-xl font-black tracking-tight text-[var(--bm-navy)] sm:text-2xl">
          배터리매니저
        </span>
      </Link>
      <p className="bm-auth-brand__tagline mt-3 text-sm font-semibold leading-relaxed text-slate-600">
        {tagline}
      </p>
    </header>
  );
}
