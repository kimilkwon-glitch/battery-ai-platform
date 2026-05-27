"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  vehicleName: string;
  fuel?: string;
  year?: string;
};

export function PhotoReviewModal({ open, onClose, vehicleName, fuel, year }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center" role="dialog">
      <button aria-label="닫기" className="absolute inset-0" onClick={onClose} type="button" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <h3 className="text-base font-black text-slate-950">사진 확인 필요</h3>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
          {vehicleName}
          {fuel ? ` · ${fuel}` : ""}
          {year ? ` · ${year}` : ""} 차량은 연식·연료·트림에 따라 배터리 규격과 단자 방향이 달라질 수 있습니다.
        </p>
        <ul className="mt-3 space-y-2 text-xs font-semibold text-slate-700">
          <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">기존 배터리 상단 라벨 사진</li>
          <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">배터리 단자 방향(+/-) 사진</li>
          <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">차량 연식·연료 정보</li>
        </ul>
        <p className="mt-3 text-[11px] font-medium text-blue-600">위 3가지를 확인하면 더 정확한 규격 안내가 가능합니다.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {/* TODO: 실제 상담/사진 업로드 URL 연결 */}
          <button
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-xs font-black text-white hover:bg-blue-700"
            type="button"
          >
            사진 보내고 확인받기
          </button>
          <button
            className="flex-1 rounded-lg bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
