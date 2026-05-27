import { bm } from "@/lib/design-tokens";

export function ImageFallback({
  label,
  sublabel,
  variant = "battery",
  className = "",
}: {
  label: string;
  sublabel?: string;
  variant?: "battery" | "vehicle" | "guide";
  className?: string;
}) {
  const boxClass =
    variant === "vehicle"
      ? `${bm.imageVehicle} rounded-xl ring-1 ring-slate-100`
      : `${bm.imageBattery} rounded-t-2xl ring-1 ring-slate-100`;

  return (
    <div className={`${boxClass} ${className}`}>
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <div
          className={`mb-2 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 ring-1 ring-slate-200/80 ${
            variant === "battery" ? "size-14" : "size-12"
          }`}
        >
          <svg className="size-6 text-slate-400" fill="none" viewBox="0 0 24 24" aria-hidden>
            {variant === "vehicle" ? (
              <path
                d="M5 16l1.5-5h11L19 16M7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4 16h16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            ) : (
              <path
                d="M6 8h12v8H6zM9 8V6h6v2M10 16h4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            )}
          </svg>
        </div>
        <p className="text-xs font-black text-slate-700">{label}</p>
        {sublabel ? <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{sublabel}</p> : null}
      </div>
    </div>
  );
}
