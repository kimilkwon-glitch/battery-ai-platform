/**
 * 차량 이미지·검색 registry — public/assets/cars/{brand}/
 * platform Vehicle.id / catalogId 와 연결
 */
import type { VehicleBodyType } from "@/components/VehicleThumbnail";
import { catalogVehicles } from "./platform-catalog";
import { carDisplayImageUrl } from "./car-image-url";
import { vehicleAssetsV04 } from "@/lib/vehicle-asset-v04";

export type CarBrandKey = "hyundai" | "kia" | "renault" | "ssangyong" | "kg";

export interface VehicleAsset {
  id: string;
  brand: CarBrandKey;
  modelGroup: string;
  displayName: string;
  generationName?: string;
  aliases: string[];
  imageFile: string;
  image: string;
  batteryNotes?: string;
  tags?: string[];
  yearRange?: string;
  /** platform-catalog Vehicle.id — 상세/배터리 카탈로그 연결 */
  catalogId?: string;
  defaultBatteryCode?: string;
  /** v04 — 기본 추천·노출 후보 제외 (2005 미만·레거시) */
  recommendExcluded?: boolean;
  batteryMatchStatus?: "needsReview" | "linked";
  /** vehicle-battery-db model 매칭 */
  dbModels?: string[];
  yearStart?: number;
}

const DEFAULT_NOTE =
  "연식, 연료, ISG 여부에 따라 배터리 규격 확인이 필요합니다.";

type LegacyCarBrandKey = "hyundai" | "kia";

const PNG = {
  main: (brand: LegacyCarBrandKey, file: string) => carDisplayImageUrl(brand, file),
};

function asset(
  id: string,
  brand: LegacyCarBrandKey,
  modelGroup: string,
  displayName: string,
  imageFile: string,
  opts: {
    generationName?: string;
    aliases?: string[];
    batteryNotes?: string;
    tags?: string[];
    yearRange?: string;
    catalogId?: string;
    defaultBatteryCode?: string;
  } = {},
): VehicleAsset {
  const aliases = opts.aliases ?? [displayName];
  const hasImage = Boolean(imageFile.trim());
  return {
    id,
    brand,
    modelGroup,
    displayName,
    generationName: opts.generationName,
    aliases: [...new Set([displayName, ...aliases])],
    imageFile: hasImage ? imageFile : "",
    image: hasImage ? PNG.main(brand, imageFile) : "",
    batteryNotes: opts.batteryNotes ?? DEFAULT_NOTE,
    tags: opts.tags,
    yearRange: opts.yearRange,
    catalogId: opts.catalogId,
    defaultBatteryCode: opts.defaultBatteryCode,
  };
}

/** 실제 public/assets/cars 스캔 기준 — staria_us4→staria_lounge, palisade_new→palisade_lx3 */
const HYUNDAI_ASSETS: VehicleAsset[] = [
  asset("grandeur-tg", "hyundai", "grandeur", "그랜저 TG", "grandeur_tg.png", {
    yearRange: "2005-2011",
    catalogId: "grandeur-tg",
    tags: ["세단"],
    aliases: ["그랜저", "그랜저 TG", "TG 그랜저", "현대 그랜저", "그랜저 5세대"],
    defaultBatteryCode: "DIN74L",
  }),
  asset("grandeur-hg", "hyundai", "grandeur", "그랜저 HG", "grandeur_hg.png", {
    yearRange: "2011-2016",
    catalogId: "grandeur-hg",
    tags: ["세단"],
    aliases: ["그랜저", "그랜저 HG", "HG 그랜저", "현대 그랜저", "그랜저 6세대"],
    defaultBatteryCode: "DIN74L",
  }),
  asset("grandeur-ig", "hyundai", "grandeur", "그랜저 IG", "grandeur_ig.png", {
    yearRange: "2016-2019",
    catalogId: "grandeur-ig",
    tags: ["세단"],
    aliases: ["그랜저", "그랜저 IG", "IG 그랜저", "현대 그랜저", "그랜저 6세대"],
    defaultBatteryCode: "AGM80L",
  }),
  asset("grandeur-ig-fl", "hyundai", "grandeur", "더 뉴 그랜저 IG", "grandeur_ig_fl.png", {
    yearRange: "2019-2022",
    catalogId: "grandeur-ig-fl",
    tags: ["세단"],
    aliases: ["그랜저", "더 뉴 그랜저", "더 뉴 IG", "현대 그랜저"],
    defaultBatteryCode: "AGM80L",
  }),
  asset("grandeur-gn7", "hyundai", "grandeur", "디 올 뉴 그랜저", "grandeur_new.png", {
    yearRange: "2022-현재",
    catalogId: "grandeur-gn7",
    tags: ["세단"],
    aliases: ["그랜저", "디 올 뉴 그랜저", "신형 그랜저", "GN7", "현대 그랜저"],
    defaultBatteryCode: "AGM80L",
  }),
  asset("sonata-nf", "hyundai", "sonata", "쏘나타 NF", "sonata_nf.png", { yearRange: "2004-2010", tags: ["세단"], aliases: ["쏘나타", "소나타", "NF 쏘나타", "현대 쏘나타"] }),
  asset("sonata-yf", "hyundai", "sonata", "YF 쏘나타", "sonata_yf.png", { yearRange: "2009-2014", tags: ["세단"], aliases: ["쏘나타", "소나타", "YF", "YF 쏘나타", "현대 쏘나타"] }),
  asset("sonata-lf", "hyundai", "sonata", "LF 쏘나타", "sonata_lf.png", { yearRange: "2014-2019", tags: ["세단"], aliases: ["쏘나타", "소나타", "LF", "LF 쏘나타", "현대 쏘나타"] }),
  asset("sonata-dn8", "hyundai", "sonata", "쏘나타 DN8", "sonata_dn8.png", {
    yearRange: "2019-2023",
    catalogId: "sonata",
    tags: ["세단"],
    aliases: ["쏘나타", "소나타", "쏘나타 DN8", "DN8", "현대 쏘나타"],
    defaultBatteryCode: "AGM80L",
  }),
  asset("sonata-edge", "hyundai", "sonata", "쏘나타 디 엣지", "sonata_edge.png", {
    yearRange: "2023-현재",
    tags: ["세단"],
    aliases: ["쏘나타", "소나타", "쏘나타 디 엣지", "디 엣지", "신형 쏘나타", "현대 쏘나타"],
    defaultBatteryCode: "AGM80L",
  }),
  asset("avante-hd", "hyundai", "avante", "아반떼 HD", "avante_hd.png", { yearRange: "2006-2010", tags: ["세단"], aliases: ["아반떼", "HD", "HD 아반떼", "현대 아반떼"] }),
  asset("avante-md", "hyundai", "avante", "아반떼 MD", "avante_md.png", { yearRange: "2010-2015", tags: ["세단"], aliases: ["아반떼", "MD", "MD 아반떼", "현대 아반떼"] }),
  asset("avante-ad", "hyundai", "avante", "아반떼 AD", "avante_ad.png", { yearRange: "2015-2020", tags: ["세단"], aliases: ["아반떼", "AD", "AD 아반떼", "현대 아반떼"] }),
  asset("avante-cn7", "hyundai", "avante", "아반떼 CN7", "avante_cn7.png", {
    yearRange: "2020-2023",
    tags: ["세단"],
    aliases: ["아반떼", "아반떼 CN7", "CN7", "현대 아반떼", "신형 아반떼"],
    defaultBatteryCode: "AGM60L",
  }),
  asset("avante-cn7-fl", "hyundai", "avante", "더 뉴 아반떼", "avante_cn7_fl.png", {
    yearRange: "2023-현재",
    tags: ["세단"],
    aliases: ["아반떼", "더 뉴 아반떼", "CN7 FL", "현대 아반떼"],
    defaultBatteryCode: "AGM60L",
  }),
  asset("tucson-jm", "hyundai", "tucson", "투싼", "tucson_jm.png", { yearRange: "2004-2009", tags: ["SUV"], aliases: ["투싼", "JM", "현대 투싼"] }),
  asset("tucson-lm", "hyundai", "tucson", "투싼 ix", "tucson_lm.png", { yearRange: "2009-2015", tags: ["SUV"], aliases: ["투싼", "투싼 ix", "ix", "현대 투싼"] }),
  asset("tucson-tl", "hyundai", "tucson", "올 뉴 투싼", "tucson_tl.png", { yearRange: "2015-2020", tags: ["SUV"], aliases: ["투싼", "올 뉴 투싼", "TL", "현대 투싼"] }),
  asset("tucson-nx4", "hyundai", "tucson", "투싼 4세대", "tucson_nx4.png", {
    yearRange: "2020-2023",
    catalogId: "tucson-nx4",
    tags: ["SUV"],
    aliases: ["투싼", "투싼 4세대", "신형 투싼", "NX4", "현대 투싼"],
    defaultBatteryCode: "AGM70L",
  }),
  asset("tucson-nx4-fl", "hyundai", "tucson", "더 뉴 투싼", "tucson_nx4_fl.png", {
    yearRange: "2023-현재",
    tags: ["SUV"],
    aliases: ["투싼", "더 뉴 투싼", "NX4 FL", "현대 투싼"],
    defaultBatteryCode: "AGM70L",
  }),
  asset("santafe-cm", "hyundai", "santafe", "싼타페 CM", "santafe_cm.png", {
    yearRange: "2006-2012",
    tags: ["SUV"],
    aliases: ["싼타페", "CM", "현대 싼타페"],
    batteryNotes: "디젤/가솔린/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("santafe-dm", "hyundai", "santafe", "싼타페 DM", "santafe_dm.png", {
    yearRange: "2012-2018",
    tags: ["SUV"],
    aliases: ["싼타페", "DM", "현대 싼타페"],
    batteryNotes: "디젤/가솔린/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("santafe-tm", "hyundai", "santafe", "싼타페 TM", "santafe_tm.png", {
    yearRange: "2018-2023",
    catalogId: "santa-fe",
    tags: ["SUV"],
    aliases: ["싼타페", "TM", "현대 싼타페"],
    defaultBatteryCode: "AGM80L",
    batteryNotes: "디젤/가솔린/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("santafe-mx5", "hyundai", "santafe", "디 올 뉴 싼타페", "santafe_mx5.png", {
    yearRange: "2023-현재",
    tags: ["SUV"],
    aliases: ["싼타페", "디 올 뉴 싼타페", "MX5", "현대 싼타페"],
    batteryNotes: "디젤/가솔린/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("santafe-mx5-hev", "hyundai", "santafe", "싼타페 하이브리드", "santafe_mx5_hev.png", {
    yearRange: "2023-현재",
    tags: ["SUV", "하이브리드"],
    aliases: ["싼타페", "싼타페 하이브리드", "싼타페 HEV", "현대 싼타페"],
    batteryNotes: "디젤/가솔린/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("palisade-lx2", "hyundai", "palisade", "팰리세이드", "palisade_lx2.png", {
    yearRange: "2019-2022",
    catalogId: "palisade",
    tags: ["SUV"],
    aliases: ["팰리세이드", "현대 팰리세이드"],
    defaultBatteryCode: "AGM95L",
  }),
  asset("palisade-lx2-fl", "hyundai", "palisade", "더 뉴 팰리세이드", "palisade_lx2_fl.png", {
    yearRange: "2022-2024",
    tags: ["SUV"],
    aliases: ["팰리세이드", "더 뉴 팰리세이드", "현대 팰리세이드"],
    defaultBatteryCode: "AGM95L",
  }),
  asset("palisade-lx3", "hyundai", "palisade", "디 올 뉴 팰리세이드", "palisade_lx3.png", {
    yearRange: "2024-현재",
    tags: ["SUV"],
    aliases: ["팰리세이드", "디 올 뉴 팰리세이드", "LX3", "신형 팰리세이드", "현대 팰리세이드"],
    defaultBatteryCode: "AGM95L",
  }),
  asset("staria-us4", "hyundai", "staria", "스타리아", "staria_lounge.png", {
    yearRange: "2021-현재",
    tags: ["상용차", "밴"],
    aliases: ["스타리아", "현대 스타리아", "스타리아 카고", "스타리아 라운지", "스타리아 투어러"],
  }),
  asset("kona-os", "hyundai", "kona", "코나", "kona_os.png", {
    yearRange: "2017-2023",
    tags: ["SUV"],
    aliases: ["코나", "현대 코나", "1세대 코나"],
  }),
  asset("kona-sx2", "hyundai", "kona", "디 올 뉴 코나", "kona_sx2.png", {
    yearRange: "2023-현재",
    tags: ["SUV"],
    aliases: ["코나", "디 올 뉴 코나", "신형 코나", "2세대 코나", "현대 코나"],
  }),
  asset("ioniq5-ne", "hyundai", "ioniq5", "아이오닉5", "ioniq5_ne.png", {
    yearRange: "2021-현재",
    catalogId: "ioniq5",
    tags: ["EV"],
    aliases: ["아이오닉5", "아이오닉 5", "IONIQ5", "IONIQ 5", "현대 아이오닉5"],
    defaultBatteryCode: "EV 12V",
    batteryNotes: "전기차 보조 12V 배터리 기준으로 별도 확인이 필요합니다.",
  }),
  asset("ioniq6-ce", "hyundai", "ioniq6", "아이오닉6", "ioniq6_ce.png", {
    yearRange: "2022-현재",
    tags: ["EV"],
    aliases: ["아이오닉6", "아이오닉 6", "IONIQ6", "IONIQ 6", "현대 아이오닉6"],
    defaultBatteryCode: "EV 12V",
    batteryNotes: "전기차 보조 12V 배터리 기준으로 별도 확인이 필요합니다.",
  }),
  asset("porter2-old", "hyundai", "porter", "포터2", "porter2_old.png", {
    yearRange: "2011-2020",
    tags: ["상용차", "트럭"],
    aliases: ["포터", "포터2", "포터 2", "현대 포터", "현대 포터2", "1톤 포터", "PORTER II"],
    batteryNotes: "연식에 따라 90Ah/100Ah 계열 분기가 필요합니다. 실제 장착 배터리 확인이 필요합니다.",
  }),
  asset("porter2-new", "hyundai", "porter", "포터2 2020년형 이후", "porter2_new.png", {
    yearRange: "2020-현재",
    tags: ["상용차", "트럭"],
    aliases: ["포터", "포터2", "포터 2020", "포터2 2020년형", "포터2 신형", "포터 100Ah", "PORTER II"],
    batteryNotes: "2020년형 이후 100Ah 계열 적용 가능성이 높아 연식 확인이 중요합니다.",
  }),
  asset("porter2-ev", "hyundai", "porter", "포터2 EV", "porter2_ev.png", {
    yearRange: "2019-현재",
    tags: ["상용차", "EV"],
    aliases: ["포터", "포터2 EV", "포터 전기차", "포터2 전기차", "PORTER II EV", "현대 포터 전기차"],
    batteryNotes: "전기차 보조 12V 배터리 기준으로 별도 확인이 필요합니다.",
  }),
];

const KIA_ASSETS: VehicleAsset[] = [
  asset("k5-tf", "kia", "k5", "K5 1세대", "k5_tf.png", { yearRange: "2009-2015", tags: ["세단"], aliases: ["K5", "케이파이브", "기아 K5", "K5 TF"] }),
  asset("k5-jf", "kia", "k5", "K5 2세대", "k5_jf.png", { yearRange: "2015-2019", tags: ["세단"], aliases: ["K5", "케이파이브", "K5 2세대", "기아 K5"] }),
  asset("k5-dl3", "kia", "k5", "K5 3세대", "k5_dl3.png", {
    yearRange: "2019-2023",
    catalogId: "k5-dl3",
    tags: ["세단"],
    aliases: ["K5", "케이파이브", "K5 3세대", "신형 K5", "기아 K5"],
    defaultBatteryCode: "DIN74L",
  }),
  asset("k5-dl3-fl", "kia", "k5", "더 뉴 K5", "k5_dl3_fl.png", {
    yearRange: "2023-현재",
    tags: ["세단"],
    aliases: ["K5", "케이파이브", "더 뉴 K5", "K5 페이스리프트", "신형 K5", "기아 K5"],
    defaultBatteryCode: "DIN74L",
  }),
  asset("k8-gl3", "kia", "k8", "K8", "k8_gl3.png", {
    yearRange: "2021-2024",
    tags: ["세단"],
    aliases: ["K8", "케이8", "기아 K8", "K8 하이브리드", "K8 LPG", "K8 가솔린"],
    batteryNotes: "가솔린/LPG/하이브리드 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("k8-gl3-fl", "kia", "k8", "더 뉴 K8", "k8_gl3_fl.png", {
    yearRange: "2024-현재",
    tags: ["세단"],
    aliases: ["K8", "케이8", "더 뉴 K8", "신형 K8", "K8 페이스리프트", "기아 K8"],
    batteryNotes: "가솔린/LPG/하이브리드 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("seltos-sp2", "kia", "seltos", "셀토스", "seltos_sp2.png", {
    yearRange: "2019-2023",
    catalogId: "seltos",
    tags: ["SUV"],
    aliases: ["셀토스", "기아 셀토스", "구형 셀토스", "셀토스 1세대"],
    defaultBatteryCode: "AGM60L",
  }),
  asset("seltos-sp2-fl", "kia", "seltos", "더 뉴 셀토스", "seltos_sp2_fl.png", {
    yearRange: "2023-현재",
    tags: ["SUV"],
    aliases: ["셀토스", "더 뉴 셀토스", "신형 셀토스", "셀토스 페이스리프트", "기아 셀토스"],
    defaultBatteryCode: "AGM60L",
  }),
  asset("sportage-sl", "kia", "sportage", "스포티지 R", "sportage_sl.png", {
    yearRange: "2004-2010",
    tags: ["SUV"],
    aliases: ["스포티지", "스포티지 R", "스포티지R", "기아 스포티지"],
  }),
  asset("sportage-ql", "kia", "sportage", "스포티지 4세대", "sportage_ql.png", {
    yearRange: "2015-2020",
    tags: ["SUV"],
    aliases: ["스포티지", "스포티지 4세대", "QL", "기아 스포티지"],
  }),
  asset("sportage-nq5", "kia", "sportage", "스포티지 5세대", "sportage_nq5.png", {
    yearRange: "2021-2023",
    tags: ["SUV"],
    aliases: ["스포티지", "스포티지 5세대", "신형 스포티지", "NQ5", "기아 스포티지"],
  }),
  asset("sportage-nq5-fl", "kia", "sportage", "더 뉴 스포티지", "sportage_nq5_fl.png", {
    yearRange: "2023-현재",
    tags: ["SUV"],
    aliases: ["스포티지", "더 뉴 스포티지", "스포티지 페이스리프트", "기아 스포티지"],
  }),
  asset("sorento-xm", "kia", "sorento", "쏘렌토 R", "sorento_xm.png", {
    yearRange: "2009-2014",
    tags: ["SUV"],
    aliases: ["쏘렌토", "소렌토", "쏘렌토 R", "기아 쏘렌토"],
    batteryNotes: "가솔린/디젤/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("sorento-um", "kia", "sorento", "올 뉴 쏘렌토", "sorento_um.png", {
    yearRange: "2014-2017",
    tags: ["SUV"],
    aliases: ["쏘렌토", "소렌토", "올 뉴 쏘렌토", "기아 쏘렌토"],
    batteryNotes: "가솔린/디젤/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("sorento-um-fl", "kia", "sorento", "더 뉴 쏘렌토", "sorento_um_fl.png", {
    yearRange: "2017-2020",
    tags: ["SUV"],
    aliases: ["쏘렌토", "소렌토", "더 뉴 쏘렌토", "쏘렌토 페이스리프트", "기아 쏘렌토"],
    batteryNotes: "가솔린/디젤/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("sorento-mq4", "kia", "sorento", "쏘렌토 4세대", "sorento_mq4.png", {
    yearRange: "2020-2023",
    catalogId: "sorento-mq4",
    tags: ["SUV"],
    aliases: ["쏘렌토", "소렌토", "쏘렌토 4세대", "MQ4", "기아 쏘렌토"],
    defaultBatteryCode: "AGM95L",
    batteryNotes: "가솔린/디젤/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("sorento-mq4-fl", "kia", "sorento", "더 뉴 쏘렌토", "sorento_mq4_fl.png", {
    yearRange: "2023-현재",
    tags: ["SUV"],
    aliases: ["쏘렌토", "소렌토", "더 뉴 쏘렌토 MQ4", "기아 쏘렌토"],
    defaultBatteryCode: "AGM95L",
    batteryNotes: "가솔린/디젤/하이브리드 및 ISG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("carnival-vq", "kia", "carnival", "그랜드 카니발", "carnival_vq.png", {
    yearRange: "2006-2014",
    tags: ["밴"],
    aliases: ["카니발", "그랜드 카니발", "기아 카니발"],
    batteryNotes: "디젤/가솔린/하이브리드 및 하이리무진 여부에 따라 배터리 확인이 필요합니다.",
  }),
  asset("carnival-yp", "kia", "carnival", "올 뉴 카니발", "carnival_yp.png", {
    yearRange: "2014-2020",
    tags: ["밴"],
    aliases: ["카니발", "올 뉴 카니발", "기아 카니발"],
    batteryNotes: "디젤/가솔린/하이브리드 및 하이리무진 여부에 따라 배터리 확인이 필요합니다.",
  }),
  asset("carnival-yp-fl", "kia", "carnival", "더 뉴 카니발", "carnival_yp_fl.png", {
    yearRange: "2018-2020",
    tags: ["밴"],
    aliases: ["카니발", "더 뉴 카니발", "기아 카니발"],
    batteryNotes: "디젤/가솔린/하이브리드 및 하이리무진 여부에 따라 배터리 확인이 필요합니다.",
  }),
  asset("carnival-ka4", "kia", "carnival", "카니발 4세대", "carnival_ka4.png", {
    yearRange: "2020-2023",
    catalogId: "carnival-ka4",
    tags: ["밴"],
    aliases: ["카니발", "카니발 4세대", "KA4", "기아 카니발"],
    defaultBatteryCode: "AGM95L",
    batteryNotes: "디젤/가솔린/하이브리드 및 하이리무진 여부에 따라 배터리 확인이 필요합니다.",
  }),
  asset("carnival-ka4-fl", "kia", "carnival", "더 뉴 카니발", "carnival_ka4_fl.png", {
    yearRange: "2023-현재",
    tags: ["밴"],
    aliases: ["카니발", "더 뉴 카니발", "카니발 4세대 FL", "기아 카니발"],
    batteryNotes: "디젤/가솔린/하이브리드 및 하이리무진 여부에 따라 배터리 확인이 필요합니다.",
  }),
  asset("k3-yd", "kia", "k3", "K3 1세대", "k3_yd.png", { yearRange: "2012-2018", tags: ["세단"], aliases: ["K3", "케이쓰리", "기아 K3"] }),
  asset("k3-bd", "kia", "k3", "올 뉴 K3", "k3_bd.png", { yearRange: "2018-2021", tags: ["세단"], aliases: ["K3", "케이쓰리", "올 뉴 K3", "기아 K3"] }),
  asset("k3-bd-fl", "kia", "k3", "더 뉴 K3", "k3_bd_fl.png", { yearRange: "2021-2024", tags: ["세단"], aliases: ["K3", "케이쓰리", "더 뉴 K3", "기아 K3"] }),
  asset("morning-sa", "kia", "morning", "뉴 모닝", "morning_sa.png", { yearRange: "2011-2015", tags: ["경차"], aliases: ["모닝", "뉴 모닝", "기아 모닝"] }),
  asset("morning-ta", "kia", "morning", "올 뉴 모닝", "morning_ta.png", { yearRange: "2015-2020", tags: ["경차"], aliases: ["모닝", "올 뉴 모닝", "기아 모닝"] }),
  asset("morning-ja", "kia", "morning", "모닝 3세대", "morning_ja.png", { yearRange: "2020-2023", tags: ["경차"], aliases: ["모닝", "모닝 3세대", "JA", "기아 모닝"] }),
  asset("morning-ja-fl", "kia", "morning", "더 뉴 모닝", "morning_ja_fl.png", { yearRange: "2023-현재", tags: ["경차"], aliases: ["모닝", "더 뉴 모닝", "기아 모닝", "모닝 3세대"] }),
  asset("ray-tam", "kia", "ray", "레이", "ray_tam.png", {
    yearRange: "2011-2022",
    tags: ["경차"],
    aliases: ["레이", "기아 레이", "구형 레이"],
  }),
  asset("ray-tam-2fl", "kia", "ray", "더 뉴 기아 레이", "", {
    yearRange: "2022-현재",
    tags: ["경차"],
    aliases: ["레이", "기아 레이", "더 뉴 레이", "더 뉴 기아 레이", "신형 레이"],
  }),
  asset("niro-de", "kia", "niro", "니로", "niro_de.png", {
    yearRange: "2016-2022",
    tags: ["SUV", "하이브리드"],
    aliases: ["니로", "기아 니로"],
    batteryNotes: "HEV/PHEV/EV 구분에 따라 보조배터리 확인 방식이 달라질 수 있습니다.",
  }),
  asset("niro-de-fl", "kia", "niro", "더 뉴 니로", "niro_de_fl.png", {
    yearRange: "2019-2022",
    tags: ["SUV", "하이브리드"],
    aliases: ["니로", "더 뉴 니로", "기아 니로"],
    batteryNotes: "HEV/PHEV/EV 구분에 따라 보조배터리 확인 방식이 달라질 수 있습니다.",
  }),
  asset("niro-sg2", "kia", "niro", "디 올 뉴 니로", "niro_sg2.png", {
    yearRange: "2022-현재",
    tags: ["SUV", "하이브리드", "EV"],
    aliases: ["니로", "디 올 뉴 니로", "신형 니로", "니로 하이브리드", "니로 EV", "기아 니로"],
    batteryNotes: "HEV/PHEV/EV 구분에 따라 보조배터리 확인 방식이 달라질 수 있습니다.",
  }),
  asset("bongo3-truck", "kia", "bongo", "봉고3", "bongo3_truck.png", {
    yearRange: "2004-현재",
    tags: ["상용차", "트럭"],
    aliases: ["봉고", "봉고3", "봉고 3", "봉고 트럭", "기아 봉고", "BONGO 3"],
    batteryNotes: "연식과 디젤/LPG 여부에 따라 배터리 규격 확인이 필요합니다.",
  }),
  asset("bongo3-ev", "kia", "bongo", "봉고3 EV", "bongo3_ev.png", {
    yearRange: "2020-현재",
    tags: ["상용차", "EV"],
    aliases: ["봉고", "봉고3 EV", "봉고 전기차", "봉고3 전기차", "BONGO 3 EV", "기아 봉고 전기차"],
    batteryNotes: "전기차 보조 12V 배터리 기준으로 별도 확인이 필요합니다.",
  }),
];

export const vehicleAssets: VehicleAsset[] = [
  ...HYUNDAI_ASSETS,
  ...KIA_ASSETS,
  ...vehicleAssetsV04,
];

/** 이미지 파일 누락 — 디스크에 없거나 이번 연결 제외 */
export const missingVehicleImageFiles = [
  "staria_us4.png (실제 파일: staria_lounge.png 로 매핑)",
  "ray_tam_2fl.png (디스크 없음 — ray_tam_fl.png는 사용 제외)",
  "palisade_new.png (실제 파일: palisade_lx3.png 로 매핑)",
];

const assetById = new Map(vehicleAssets.map((a) => [a.id, a]));
const aliasIndex = new Map<string, VehicleAsset>();

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

for (const a of vehicleAssets) {
  for (const alias of a.aliases) {
    aliasIndex.set(norm(alias), a);
  }
  aliasIndex.set(norm(a.displayName), a);
  aliasIndex.set(norm(a.id), a);
}

export function getVehicleAsset(id: string): VehicleAsset | undefined {
  return assetById.get(id) ?? aliasIndex.get(norm(id));
}

export function carImageForVehicleId(vehicleId: string): string | null {
  const a =
    assetById.get(vehicleId) ??
    vehicleAssets.find((x) => x.catalogId === vehicleId) ??
    aliasIndex.get(norm(vehicleId));
  return a?.image || null;
}

export function bodyTypeFromAsset(asset: VehicleAsset): VehicleBodyType {
  const tags = asset.tags ?? [];
  if (tags.includes("EV")) return "ev";
  if (tags.includes("밴") || tags.includes("상용차")) return "van";
  if (tags.includes("트럭")) return "truck";
  if (tags.includes("경차")) return "compactSuv";
  if (tags.includes("SUV")) return "suv";
  return "sedan";
}

const BRAND_LABELS: Record<CarBrandKey, string> = {
  hyundai: "현대",
  kia: "기아",
  renault: "르노코리아",
  ssangyong: "쌍용",
  kg: "KGM",
};

export function vehicleAssetBrandLabel(brand: CarBrandKey): string {
  return BRAND_LABELS[brand] ?? brand;
}

export function getVehicleAssetsByBrand(brand?: CarBrandKey): VehicleAsset[] {
  if (!brand) return vehicleAssets;
  return vehicleAssets.filter((a) => a.brand === brand);
}

export function vehicleAssetHref(asset: VehicleAsset): string {
  const slug = asset.catalogId ?? asset.id;
  if (catalogVehicles.some((v) => v.id === slug)) return `/vehicle/${slug}`;
  return `/vehicle/${asset.id}`;
}

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function chosung(text: string): string {
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        return CHO[Math.floor((code - 0xac00) / 588)] ?? "";
      }
      return ch;
    })
    .join("");
}

function matchesQuery(text: string, q: string): boolean {
  const n = norm(text);
  if (n.includes(q)) return true;
  if (/^[ㄱ-ㅎ]+$/.test(q)) return chosung(text).includes(q);
  return false;
}

export function searchVehicleAssets(query: string, limit = 12): VehicleAsset[] {
  const q = norm(query);
  const pool = vehicleAssets.filter((a) => !a.recommendExcluded);
  if (!q) return pool.slice(0, limit);

  const scored: { asset: VehicleAsset; score: number }[] = [];

  for (const a of pool) {
    let score = 0;
    if (norm(a.displayName) === q) score += 100;
    else if (matchesQuery(a.displayName, q)) score += 80;
    else if (a.aliases.some((al) => matchesQuery(al, q))) score += 60;
    else if (matchesQuery(a.modelGroup, q)) score += 40;
    else if (a.tags?.some((t) => matchesQuery(t, q))) score += 20;

    if (score > 0) scored.push({ asset: a, score });
  }

  return scored
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((s) => s.asset);
}

export function getVehicleAssetCount() {
  return vehicleAssets.length;
}
