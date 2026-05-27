import type { CarModelHub } from "../types";
import { hyundaiGrandeurGenerations, hyundaiGrandeurHub } from "./grandeur";

export { hyundaiGrandeurGenerations, hyundaiGrandeurHub } from "./grandeur";

/** 현대 차종 허브 목록 — 모델 추가 시 여기에 등록 */
export const hyundaiModelHubs: CarModelHub[] = [
  {
    brandKey: "hyundai",
    modelKey: "grandeur",
    displayName: hyundaiGrandeurHub.displayName,
    description: hyundaiGrandeurHub.description,
    href: hyundaiGrandeurHub.href,
    generationCount: hyundaiGrandeurGenerations.length,
    coverImageFile: "grandeur_new.png",
  },
];
