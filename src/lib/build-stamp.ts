import stampConfig from "../../build-stamp.json";

/** 배포 파이프라인 단일 소스 — footer·DOM·검증 스크립트와 동기화 */
export const BUILD_STAMP = stampConfig.stamp;

/** 빌드 캐시 무효화용 — stamp 변경 시 layout/ footer에 반영되도록 */
export const BUILD_STAMP_REV = "BM-QUICK-MENU-CARD-ALIGN-20260530-V1" as const;
