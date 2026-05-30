// Battery Manager Vehicle Alias DB v0.1
// 목적: 고객이 실제로 부르는 이름/별칭/세대명/파생명 검색어를 정확한 차량 세대 slug로 매핑하기 위한 초안.
// 주의: 배터리 규격은 기존 Battery Manager DB를 우선 사용하고, 이 파일은 검색 alias/intent 매핑용으로 사용한다.
// 원칙:
// 1) aliases는 검색 매칭용 + 차량 상세 상단 "다르게 부르는 이름" 노출용.
// 2) displayAliases는 고객 화면 노출용. 너무 개발자스러운 코드명만 있는 경우 제외 가능.
// 3) matchPriority는 exact > alias > generation > fuzzy 순위에서 alias 가중치에 활용.
// 4) coupe/van/wagon/EV/HEV/LPG/diesel 같은 파생명은 notes와 intentTags에 반드시 남긴다.
// 5) slug는 현재 프로젝트 slug와 다를 수 있으므로 Cursor가 기존 slug에 맞춰 병합한다.

export type VehicleAliasEntry = {
  brandGroup: 'hyundai' | 'kia' | 'genesis' | 'chevrolet_gm' | 'renault_samsung' | 'kgm_ssangyong';
  brandLabel: string;
  canonicalName: string;
  slugHint: string;
  yearRange?: string;
  generationCode?: string;
  generationName?: string;
  displayAliases: string[];
  aliases: string[];
  intentTags: string[];
  mapTo?: {
    vehicleFamily: string;
    generation?: string;
    trimOrDerivative?: string;
    fuel?: 'gasoline' | 'diesel' | 'lpg' | 'hev' | 'ev' | 'unknown';
  };
  notes?: string;
};

export const vehicleAliasDbV01: VehicleAliasEntry[] = [
  // =========================================================
  // HYUNDAI - 현대
  // =========================================================
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '아반떼 MD',
    slugHint: 'hyundai-avante-md',
    yearRange: '2010-2015',
    generationCode: 'MD',
    generationName: '아반떼 5세대',
    displayAliases: ['아반떼 MD', 'MD 아반떼', '더 뉴 아반떼 MD'],
    aliases: ['아반떼MD', '아반떼 md', 'MD아반떼', 'md 아반떼', '더뉴아반떼MD', '더 뉴 아반떼 MD', '아반떼 5세대'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '아반떼', generation: 'MD' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '아반떼 AD',
    slugHint: 'hyundai-avante-ad',
    yearRange: '2015-2020',
    generationCode: 'AD',
    generationName: '아반떼 6세대',
    displayAliases: ['아반떼 AD', 'AD 아반떼', '아반떼 스포츠', '삼각떼'],
    aliases: ['아반떼AD', '아반떼 ad', 'AD아반떼', 'ad 아반떼', '아반떼 스포츠', '아반떼스포츠', '삼각떼', '더뉴아반떼AD', '더 뉴 아반떼 AD', '아반떼 6세대'],
    intentTags: ['vehicle', 'generation', 'nickname', 'sport'],
    mapTo: { vehicleFamily: '아반떼', generation: 'AD' },
    notes: '삼각떼는 주로 AD 페이스리프트를 부르는 별칭. 검색 시 AD 계열로 우선 연결.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '아반떼 CN7',
    slugHint: 'hyundai-avante-cn7',
    yearRange: '2020-현재',
    generationCode: 'CN7',
    generationName: '아반떼 7세대',
    displayAliases: ['아반떼 CN7', 'CN7 아반떼', '더 뉴 아반떼 CN7'],
    aliases: ['아반떼CN7', '아반떼 cn7', 'CN7아반떼', 'cn7 아반떼', '더뉴아반떼CN7', '더 뉴 아반떼 CN7', '아반떼 7세대'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '아반떼', generation: 'CN7' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '쏘나타 NF',
    slugHint: 'hyundai-sonata-nf',
    yearRange: '2004-2009',
    generationCode: 'NF',
    displayAliases: ['쏘나타 NF', '소나타 NF', 'NF 쏘나타'],
    aliases: ['쏘나타NF', '소나타NF', 'NF쏘나타', 'NF소나타', 'nf 쏘나타', 'nf 소나타', '트랜스폼', '쏘나타 트랜스폼', '소나타 트랜스폼'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '쏘나타', generation: 'NF' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '쏘나타 YF',
    slugHint: 'hyundai-sonata-yf',
    yearRange: '2009-2014',
    generationCode: 'YF',
    displayAliases: ['쏘나타 YF', '소나타 YF', 'YF 쏘나타'],
    aliases: ['쏘나타YF', '소나타YF', 'YF쏘나타', 'YF소나타', 'yf 쏘나타', 'yf 소나타', 'YF 하이브리드', 'YF쏘나타 하이브리드', '쏘나타 하이브리드 YF'],
    intentTags: ['vehicle', 'generation', 'hev'],
    mapTo: { vehicleFamily: '쏘나타', generation: 'YF' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '쏘나타 LF',
    slugHint: 'hyundai-sonata-lf',
    yearRange: '2014-2019',
    generationCode: 'LF',
    displayAliases: ['쏘나타 LF', '소나타 LF', 'LF 쏘나타', '쏘나타 뉴라이즈'],
    aliases: ['쏘나타LF', '소나타LF', 'LF쏘나타', 'LF소나타', 'lf 쏘나타', 'lf 소나타', '쏘나타 뉴라이즈', '소나타 뉴라이즈', '뉴라이즈', 'LF 뉴라이즈', '쏘나타 하이브리드 LF', 'LF쏘나타 하이브리드', 'LF LPG', 'LF소나타 LPG'],
    intentTags: ['vehicle', 'generation', 'facelift', 'hev', 'lpg'],
    mapTo: { vehicleFamily: '쏘나타', generation: 'LF' },
    notes: '뉴라이즈는 LF 페이스리프트. 검색 시 LF 계열로 연결하되, 화면에는 뉴라이즈 별칭을 보여준다.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '쏘나타 DN8',
    slugHint: 'hyundai-sonata-dn8',
    yearRange: '2019-현재',
    generationCode: 'DN8',
    displayAliases: ['쏘나타 DN8', '소나타 DN8', 'DN8 쏘나타', '디 엣지'],
    aliases: ['쏘나타DN8', '소나타DN8', 'DN8쏘나타', 'DN8소나타', 'dn8 쏘나타', 'dn8 소나타', '쏘나타 디엣지', '쏘나타 디 엣지', '소나타 디엣지', '소나타 디 엣지', '쏘나타 하이브리드 DN8', 'DN8 하이브리드', 'DN8 LPG'],
    intentTags: ['vehicle', 'generation', 'facelift', 'hev', 'lpg'],
    mapTo: { vehicleFamily: '쏘나타', generation: 'DN8' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '그랜저 TG',
    slugHint: 'hyundai-grandeur-tg',
    yearRange: '2005-2011',
    generationCode: 'TG',
    displayAliases: ['그랜저 TG', 'TG 그랜저', '뉴럭셔리 그랜저'],
    aliases: ['그랜저TG', 'TG그랜저', 'tg 그랜저', '뉴럭셔리 그랜저', '그랜저 뉴럭셔리', '더럭셔리 그랜저', '그랜저 4세대'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '그랜저', generation: 'TG' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '그랜저 HG',
    slugHint: 'hyundai-grandeur-hg',
    yearRange: '2011-2016',
    generationCode: 'HG',
    displayAliases: ['그랜저 HG', 'HG 그랜저', '그랜저 하이브리드 HG'],
    aliases: ['그랜저HG', 'HG그랜저', 'hg 그랜저', '그랜져HG', 'HG그랜져', '그랜저 하이브리드 HG', 'HG 하이브리드', '그랜저HG LPG', '그랜저 5세대'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: '그랜저', generation: 'HG' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '그랜저 IG',
    slugHint: 'hyundai-grandeur-ig',
    yearRange: '2016-2022',
    generationCode: 'IG',
    displayAliases: ['그랜저 IG', 'IG 그랜저', '더 뉴 그랜저', '그랜저 르블랑'],
    aliases: ['그랜저IG', 'IG그랜저', 'ig 그랜저', '그랜져IG', 'IG그랜져', '더뉴그랜저', '더 뉴 그랜저', '더뉴그랜져', '더 뉴 그랜져', '그랜저 르블랑', '그랜저르블랑', 'IG 하이브리드', '그랜저IG 하이브리드', '그랜저IG LPG', '그랜저 6세대'],
    intentTags: ['vehicle', 'generation', 'facelift', 'hev', 'lpg'],
    mapTo: { vehicleFamily: '그랜저', generation: 'IG' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '디 올 뉴 그랜저 GN7',
    slugHint: 'hyundai-grandeur-gn7',
    yearRange: '2022-현재',
    generationCode: 'GN7',
    displayAliases: ['디 올 뉴 그랜저', '그랜저 GN7', 'GN7 그랜저'],
    aliases: ['디올뉴그랜저', '디 올 뉴 그랜저', '그랜저GN7', 'GN7그랜저', 'gn7 그랜저', '그랜저 7세대', '신형 그랜저', '올뉴그랜저', '올 뉴 그랜저', '그랜저 하이브리드 GN7', 'GN7 하이브리드', 'GN7 LPG'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: '그랜저', generation: 'GN7' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '싼타페 CM',
    slugHint: 'hyundai-santafe-cm',
    yearRange: '2005-2012',
    generationCode: 'CM',
    displayAliases: ['싼타페 CM', 'CM 싼타페', '더 스타일 싼타페'],
    aliases: ['싼타페CM', '산타페CM', 'CM싼타페', 'CM산타페', '더스타일 싼타페', '더 스타일 싼타페', '싼타페 더스타일', '싼타페 2세대'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '싼타페', generation: 'CM', fuel: 'diesel' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '싼타페 DM',
    slugHint: 'hyundai-santafe-dm',
    yearRange: '2012-2018',
    generationCode: 'DM',
    displayAliases: ['싼타페 DM', '맥스크루즈', '싼타페 더 프라임'],
    aliases: ['싼타페DM', '산타페DM', 'DM싼타페', 'DM산타페', '맥스크루즈', '맥스 크루즈', '싼타페 더프라임', '싼타페 더 프라임', '산타페 더프라임', '산타페 더 프라임', '더프라임 싼타페', '더 프라임 싼타페', '싼타페 3세대'],
    intentTags: ['vehicle', 'generation', 'facelift', 'diesel'],
    mapTo: { vehicleFamily: '싼타페', generation: 'DM' },
    notes: '더 프라임은 DM 후기형/페이스리프트 계열로 우선 연결. 21년식 싼타페와 혼동되면 안 됨.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '싼타페 TM',
    slugHint: 'hyundai-santafe-tm',
    yearRange: '2018-2023',
    generationCode: 'TM',
    displayAliases: ['싼타페 TM', '더 뉴 싼타페', '싼타페 하이브리드 TM'],
    aliases: ['싼타페TM', '산타페TM', 'TM싼타페', 'TM산타페', '더뉴싼타페', '더 뉴 싼타페', '더뉴산타페', '더 뉴 산타페', '싼타페 하이브리드', '싼타페TM 하이브리드', 'TM 하이브리드', '싼타페TM 디젤', '싼타페 4세대'],
    intentTags: ['vehicle', 'generation', 'facelift', 'diesel', 'hev'],
    mapTo: { vehicleFamily: '싼타페', generation: 'TM' },
    notes: '21년식 더 뉴 싼타페는 TM 페이스리프트 계열로 연결.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '디 올 뉴 싼타페 MX5',
    slugHint: 'hyundai-santafe-mx5',
    yearRange: '2023-현재',
    generationCode: 'MX5',
    displayAliases: ['디 올 뉴 싼타페', '싼타페 MX5', 'MX5 싼타페'],
    aliases: ['디올뉴싼타페', '디 올 뉴 싼타페', '싼타페MX5', '산타페MX5', 'MX5싼타페', 'MX5산타페', '신형 싼타페', '싼타페 5세대', '싼타페 하이브리드 MX5', 'MX5 하이브리드'],
    intentTags: ['vehicle', 'generation', 'hev'],
    mapTo: { vehicleFamily: '싼타페', generation: 'MX5' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '투싼 NX4',
    slugHint: 'hyundai-tucson-nx4',
    yearRange: '2020-현재',
    generationCode: 'NX4',
    displayAliases: ['투싼 NX4', '올 뉴 투싼', '더 뉴 투싼 NX4'],
    aliases: ['투싼NX4', 'NX4투싼', 'nx4 투싼', '올뉴투싼', '올 뉴 투싼', '더뉴투싼', '더 뉴 투싼', '투싼 하이브리드', '투싼NX4 하이브리드', 'NX4 하이브리드'],
    intentTags: ['vehicle', 'generation', 'hev', 'diesel'],
    mapTo: { vehicleFamily: '투싼', generation: 'NX4' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '코나 1세대 OS',
    slugHint: 'hyundai-kona-os',
    yearRange: '2017-2023',
    generationCode: 'OS',
    displayAliases: ['코나 1세대', '코나 OS', '코나 EV', '더 뉴 코나'],
    aliases: ['코나OS', 'OS코나', '코나EV', '코나 ev', '코나 전기', '코나 전기차', '코나 일렉트릭', '코나 하이브리드', '더뉴코나', '더 뉴 코나', '코나 1세대'],
    intentTags: ['vehicle', 'generation', 'ev', 'hev'],
    mapTo: { vehicleFamily: '코나', generation: 'OS' },
    notes: '코나EV/전기는 보조배터리 검색 흐름으로도 연결.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '디 올 뉴 코나 SX2',
    slugHint: 'hyundai-kona-sx2',
    yearRange: '2023-현재',
    generationCode: 'SX2',
    displayAliases: ['디 올 뉴 코나', '코나 SX2', '코나 EV 2세대'],
    aliases: ['디올뉴코나', '디 올 뉴 코나', '코나SX2', 'SX2코나', '신형 코나', '코나 2세대', '코나EV 2세대', '코나 일렉트릭 2세대', '코나 하이브리드 SX2'],
    intentTags: ['vehicle', 'generation', 'ev', 'hev'],
    mapTo: { vehicleFamily: '코나', generation: 'SX2' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '팰리세이드 LX2',
    slugHint: 'hyundai-palisade-lx2',
    yearRange: '2018-2025',
    generationCode: 'LX2',
    displayAliases: ['팰리세이드', '펠리세이드', '더 뉴 팰리세이드'],
    aliases: ['팰리세이드', '펠리세이드', '팰리', '펠리', '팰리세이드LX2', '펠리세이드LX2', '더뉴팰리세이드', '더 뉴 팰리세이드', '더뉴펠리세이드', '팰리세이드 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '팰리세이드', generation: 'LX2' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '스타리아 US4',
    slugHint: 'hyundai-staria-us4',
    yearRange: '2021-현재',
    generationCode: 'US4',
    displayAliases: ['스타리아', '스타리아 라운지', '스타리아 카고', '스타리아 투어러'],
    aliases: ['스타리아', '스타리아US4', 'US4스타리아', '스타리아 라운지', '스타리아라운지', '스타리아 카고', '스타리아카고', '스타리아 투어러', '스타리아투어러', '스타리아 LPG', '스타리아 디젤', '스타리아 하이브리드', '스타리아 HEV', '스타리아 AGM80R'],
    intentTags: ['vehicle', 'generation', 'diesel', 'lpg', 'hev', 'agm80r'],
    mapTo: { vehicleFamily: '스타리아', generation: 'US4' },
    notes: '스타리아는 Battery Manager 기준 AGM80R 중심. AGM80L/CMF80L과 혼동 금지.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '포터2',
    slugHint: 'hyundai-porter2',
    yearRange: '2004-현재',
    generationCode: 'HR',
    displayAliases: ['포터2', '포터Ⅱ', '포터 일렉트릭', '포터 전기'],
    aliases: ['포터2', '포터 2', '포터Ⅱ', '포터II', '포터', '포터 디젤', '포터 LPG', '포터2 2020년식', '포터2 20년식', '포터 일렉트릭', '포터일렉트릭', '포터 전기', '포터 전기차', '포터2 EV', '포터 EV'],
    intentTags: ['vehicle', 'commercial', 'year_branch', 'ev'],
    mapTo: { vehicleFamily: '포터2', generation: 'HR' },
    notes: '일반 포터2는 2020년 전후 90R/100R 분기. 포터 전기/일렉트릭은 일반 디젤 90R/100R만 띄우지 말고 EV 보조배터리 안내도 함께 연결.'
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '아이오닉5 NE',
    slugHint: 'hyundai-ioniq5-ne',
    yearRange: '2021-현재',
    generationCode: 'NE',
    displayAliases: ['아이오닉5', '아이오닉 5', 'IONIQ 5'],
    aliases: ['아이오닉5', '아이오닉 5', 'IONIQ5', 'IONIQ 5', 'ioniq5', 'ioniq 5', '아이오닉5 보조배터리', '아이오닉5 12V', '아이오닉5 배터리'],
    intentTags: ['vehicle', 'ev', 'aux_battery'],
    mapTo: { vehicleFamily: '아이오닉5', generation: 'NE', fuel: 'ev' }
  },
  {
    brandGroup: 'hyundai',
    brandLabel: '현대',
    canonicalName: '아이오닉6 CE',
    slugHint: 'hyundai-ioniq6-ce',
    yearRange: '2022-현재',
    generationCode: 'CE',
    displayAliases: ['아이오닉6', '아이오닉 6', 'IONIQ 6'],
    aliases: ['아이오닉6', '아이오닉 6', 'IONIQ6', 'IONIQ 6', 'ioniq6', 'ioniq 6', '아이오닉6 보조배터리', '아이오닉6 12V', '아이오닉6 배터리'],
    intentTags: ['vehicle', 'ev', 'aux_battery'],
    mapTo: { vehicleFamily: '아이오닉6', generation: 'CE', fuel: 'ev' }
  },

  // =========================================================
  // KIA - 기아
  // =========================================================
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'K3 1세대',
    slugHint: 'kia-k3-1st',
    yearRange: '2012-2018',
    generationName: 'K3 1세대',
    displayAliases: ['K3', '케이쓰리', 'K3 쿱', 'K3 쿠페', 'K3 유로'],
    aliases: ['K3', 'k3', '케이쓰리', '케이3', '케삼', 'K3 1세대', 'k3 1세대', 'K3쿱', 'K3 쿱', 'K3쿠페', 'K3 쿠페', 'K3 Koup', 'K3 koup', '케이쓰리 쿱', '케이쓰리 쿠페', 'K3 유로', 'K3유로'],
    intentTags: ['vehicle', 'generation', 'coupe', 'hatchback'],
    mapTo: { vehicleFamily: 'K3', generation: '1세대', trimOrDerivative: 'K3 Koup/K3 Euro' },
    notes: 'K3 쿱/Koup/쿠페는 1세대 계열 파생 모델로 우선 연결. K3 유로도 1세대 해치백 계열.'
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '올 뉴 K3 2세대',
    slugHint: 'kia-k3-bd',
    yearRange: '2018-2021',
    generationCode: 'BD',
    generationName: 'K3 2세대',
    displayAliases: ['올 뉴 K3', 'K3 2세대', 'K3 BD'],
    aliases: ['올뉴K3', '올 뉴 K3', 'K3 2세대', 'k3 2세대', 'K3BD', 'K3 BD', 'BD K3', 'BDK3'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: 'K3', generation: 'BD' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '더 뉴 K3 2세대',
    slugHint: 'kia-k3-bd-facelift',
    yearRange: '2021-2024',
    generationCode: 'BD FL',
    generationName: 'K3 2세대 페이스리프트',
    displayAliases: ['더 뉴 K3', 'K3 GT', 'K3 2세대 페이스리프트'],
    aliases: ['더뉴K3', '더 뉴 K3', 'K3 GT', 'K3GT', '케이쓰리 GT', '케이쓰리GT', 'K3 2세대 페리', 'K3 페이스리프트'],
    intentTags: ['vehicle', 'generation', 'facelift', 'gt'],
    mapTo: { vehicleFamily: 'K3', generation: 'BD FL', trimOrDerivative: 'GT' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'K5 1세대 TF',
    slugHint: 'kia-k5-tf',
    yearRange: '2010-2015',
    generationCode: 'TF',
    displayAliases: ['K5 1세대', 'K5 TF', '더 뉴 K5'],
    aliases: ['K5', 'k5', '케이파이브', '케이5', 'K5TF', 'TF K5', '더뉴K5', '더 뉴 K5', 'K5 하이브리드 TF', 'K5 LPG TF'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: 'K5', generation: 'TF' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'K5 2세대 JF',
    slugHint: 'kia-k5-jf',
    yearRange: '2015-2019',
    generationCode: 'JF',
    displayAliases: ['K5 2세대', 'K5 JF', '올 뉴 K5'],
    aliases: ['K5JF', 'JF K5', '올뉴K5', '올 뉴 K5', '더뉴K5 2세대', '더 뉴 K5 2세대', 'K5 하이브리드 JF', 'K5 LPG JF'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: 'K5', generation: 'JF' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'K5 3세대 DL3',
    slugHint: 'kia-k5-dl3',
    yearRange: '2019-현재',
    generationCode: 'DL3',
    displayAliases: ['K5 3세대', 'K5 DL3', '신형 K5'],
    aliases: ['K5DL3', 'DL3 K5', '신형K5', '신형 K5', 'K5 3세대', 'K5 하이브리드 DL3', 'K5 LPG DL3', '더뉴K5 DL3', '더 뉴 K5 DL3'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: 'K5', generation: 'DL3' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'K7 VG',
    slugHint: 'kia-k7-vg',
    yearRange: '2009-2016',
    generationCode: 'VG',
    displayAliases: ['K7 1세대', 'K7 VG', '더 뉴 K7'],
    aliases: ['K7', 'k7', '케이세븐', '케이7', 'K7VG', 'VG K7', '더뉴K7', '더 뉴 K7', 'K7 하이브리드 VG'],
    intentTags: ['vehicle', 'generation', 'hev'],
    mapTo: { vehicleFamily: 'K7', generation: 'VG' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '올 뉴 K7 YG',
    slugHint: 'kia-k7-yg',
    yearRange: '2016-2021',
    generationCode: 'YG',
    displayAliases: ['올 뉴 K7', 'K7 YG', 'K7 프리미어'],
    aliases: ['올뉴K7', '올 뉴 K7', 'K7YG', 'YG K7', 'K7 프리미어', 'K7프리미어', '더뉴K7 YG', 'K7 하이브리드 YG'],
    intentTags: ['vehicle', 'generation', 'facelift', 'hev'],
    mapTo: { vehicleFamily: 'K7', generation: 'YG' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'K8 GL3',
    slugHint: 'kia-k8-gl3',
    yearRange: '2021-현재',
    generationCode: 'GL3',
    displayAliases: ['K8', '케이에잇', 'K8 하이브리드'],
    aliases: ['K8', 'k8', '케이에잇', '케이8', 'K8GL3', 'GL3 K8', 'K8 하이브리드', 'K8 HEV', 'K8 LPG', 'K8 하브'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: 'K8', generation: 'GL3' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '스포티지 R SL',
    slugHint: 'kia-sportage-sl',
    yearRange: '2010-2015',
    generationCode: 'SL',
    displayAliases: ['스포티지 R', '스포티지 SL', '더 뉴 스포티지 R'],
    aliases: ['스포티지R', '스포티지 R', '스포티지SL', 'SL스포티지', '더뉴스포티지R', '더 뉴 스포티지 R', '스포티지 3세대'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '스포티지', generation: 'SL' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '스포티지 QL',
    slugHint: 'kia-sportage-ql',
    yearRange: '2015-2021',
    generationCode: 'QL',
    displayAliases: ['스포티지 QL', '올 뉴 스포티지', '스포티지 더 볼드'],
    aliases: ['스포티지QL', 'QL스포티지', '올뉴스포티지', '올 뉴 스포티지', '스포티지 더볼드', '스포티지 더 볼드', '더볼드 스포티지', '스포티지 4세대'],
    intentTags: ['vehicle', 'generation', 'facelift', 'diesel'],
    mapTo: { vehicleFamily: '스포티지', generation: 'QL' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '스포티지 NQ5',
    slugHint: 'kia-sportage-nq5',
    yearRange: '2021-현재',
    generationCode: 'NQ5',
    displayAliases: ['스포티지 NQ5', '디 올 뉴 스포티지', '스포티지 하이브리드'],
    aliases: ['스포티지NQ5', 'NQ5스포티지', 'nq5 스포티지', '디올뉴스포티지', '디 올 뉴 스포티지', '신형 스포티지', '스포티지 하이브리드', '스포티지 하브', '스포티지 HEV', '스포티지 LPG', '스포티지 5세대'],
    intentTags: ['vehicle', 'generation', 'hev', 'lpg'],
    mapTo: { vehicleFamily: '스포티지', generation: 'NQ5' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '쏘렌토 R XM',
    slugHint: 'kia-sorento-xm',
    yearRange: '2009-2014',
    generationCode: 'XM',
    displayAliases: ['쏘렌토 R', '소렌토 R', '쏘렌토 XM'],
    aliases: ['쏘렌토R', '소렌토R', '쏘렌토 R', '소렌토 R', '쏘렌토XM', 'XM쏘렌토', '쏘렌토 2세대'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '쏘렌토', generation: 'XM' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '올 뉴 쏘렌토 UM',
    slugHint: 'kia-sorento-um',
    yearRange: '2014-2020',
    generationCode: 'UM',
    displayAliases: ['올 뉴 쏘렌토', '쏘렌토 UM', '더 뉴 쏘렌토', '쏘렌토 더 마스터'],
    aliases: ['올뉴쏘렌토', '올 뉴 쏘렌토', '올뉴소렌토', '쏘렌토UM', '소렌토UM', 'UM쏘렌토', '더뉴쏘렌토', '더 뉴 쏘렌토', '쏘렌토 더마스터', '쏘렌토 더 마스터', '쏘렌토 3세대'],
    intentTags: ['vehicle', 'generation', 'facelift', 'diesel'],
    mapTo: { vehicleFamily: '쏘렌토', generation: 'UM' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '쏘렌토 MQ4',
    slugHint: 'kia-sorento-mq4',
    yearRange: '2020-현재',
    generationCode: 'MQ4',
    displayAliases: ['쏘렌토 MQ4', '쏘렌토 하이브리드', '쏘렌토 하브', '더 뉴 쏘렌토 MQ4'],
    aliases: ['쏘렌토MQ4', '소렌토MQ4', 'MQ4쏘렌토', 'MQ4소렌토', 'mq4 쏘렌토', '쏘렌토 하이브리드', '쏘렌토 하브', '쏘렌토 HEV', '쏘렌토 hev', '쏘렌토MQ4 하이브리드', 'MQ4 하이브리드', '더뉴쏘렌토 MQ4', '더 뉴 쏘렌토 MQ4', '쏘렌토 4세대'],
    intentTags: ['vehicle', 'generation', 'hev', 'diesel', 'gasoline'],
    mapTo: { vehicleFamily: '쏘렌토', generation: 'MQ4' },
    notes: '하이브리드 검색은 AGM60L primary, 디젤/가솔린은 AGM80L 후보로 분기. 두 규격을 같은 확정 추천처럼 섞지 말 것.'
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '올 뉴 카니발 YP',
    slugHint: 'kia-carnival-yp',
    yearRange: '2014-2020',
    generationCode: 'YP',
    displayAliases: ['올 뉴 카니발', '더 뉴 카니발', '카니발 YP'],
    aliases: ['올뉴카니발', '올 뉴 카니발', '더뉴카니발', '더 뉴 카니발', '카니발YP', 'YP카니발', '카니발 3세대', '카니발 9인승', '카니발 11인승'],
    intentTags: ['vehicle', 'generation', 'facelift', 'diesel'],
    mapTo: { vehicleFamily: '카니발', generation: 'YP' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '카니발 KA4',
    slugHint: 'kia-carnival-ka4',
    yearRange: '2020-현재',
    generationCode: 'KA4',
    displayAliases: ['카니발 KA4', '4세대 카니발', '더 뉴 카니발 KA4'],
    aliases: ['카니발KA4', 'KA4카니발', 'ka4 카니발', '4세대 카니발', '신형 카니발', '더뉴카니발 KA4', '더 뉴 카니발 KA4', '카니발 하이브리드', '카니발 하브', '카니발 HEV', '카니발 7인승', '카니발 9인승'],
    intentTags: ['vehicle', 'generation', 'hev', 'diesel', 'gasoline'],
    mapTo: { vehicleFamily: '카니발', generation: 'KA4' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '레이 1세대',
    slugHint: 'kia-ray-1st',
    yearRange: '2011-현재',
    displayAliases: ['레이', '더 뉴 레이', '레이 EV'],
    aliases: ['레이', '기아레이', '더뉴레이', '더 뉴 레이', '더뉴 기아 레이', '더 뉴 기아 레이', '레이EV', '레이 EV', '레이 전기', '레이 전기차', '레이 밴', '레이밴'],
    intentTags: ['vehicle', 'generation', 'ev', 'van'],
    mapTo: { vehicleFamily: '레이', generation: '1세대' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '모닝 TA',
    slugHint: 'kia-morning-ta',
    yearRange: '2011-2017',
    generationCode: 'TA',
    displayAliases: ['올 뉴 모닝', '모닝 TA', '더 뉴 모닝'],
    aliases: ['올뉴모닝', '올 뉴 모닝', '모닝TA', 'TA모닝', '더뉴모닝', '더 뉴 모닝', '모닝 바이퓨얼', '모닝 LPG', '모닝 2세대'],
    intentTags: ['vehicle', 'generation', 'lpg'],
    mapTo: { vehicleFamily: '모닝', generation: 'TA' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '모닝 JA',
    slugHint: 'kia-morning-ja',
    yearRange: '2017-현재',
    generationCode: 'JA',
    displayAliases: ['올 뉴 모닝 JA', '모닝 어반', '더 뉴 모닝'],
    aliases: ['모닝JA', 'JA모닝', '올뉴모닝 JA', '올 뉴 모닝 JA', '모닝 어반', '모닝어반', '더뉴모닝 JA', '더 뉴 모닝 JA', '모닝 3세대'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '모닝', generation: 'JA' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '니로 DE',
    slugHint: 'kia-niro-de',
    yearRange: '2016-2021',
    generationCode: 'DE',
    displayAliases: ['니로 1세대', '니로 하이브리드', '니로 EV'],
    aliases: ['니로DE', 'DE니로', '니로 하이브리드', '니로 하브', '니로 HEV', '니로EV', '니로 EV', '니로 전기', '니로 전기차', '니로 플러그인', '니로 PHEV', '더뉴니로', '더 뉴 니로'],
    intentTags: ['vehicle', 'generation', 'hev', 'ev', 'phev'],
    mapTo: { vehicleFamily: '니로', generation: 'DE' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '디 올 뉴 니로 SG2',
    slugHint: 'kia-niro-sg2',
    yearRange: '2022-현재',
    generationCode: 'SG2',
    displayAliases: ['디 올 뉴 니로', '니로 SG2', '니로 플러스'],
    aliases: ['디올뉴니로', '디 올 뉴 니로', '니로SG2', 'SG2니로', '신형 니로', '니로 2세대', '니로 플러스', '니로플러스', '니로EV 2세대', '니로 EV 2세대', '니로 하이브리드 SG2'],
    intentTags: ['vehicle', 'generation', 'hev', 'ev'],
    mapTo: { vehicleFamily: '니로', generation: 'SG2' }
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: '봉고3',
    slugHint: 'kia-bongo3',
    yearRange: '2004-현재',
    displayAliases: ['봉고3', '봉고Ⅲ', '봉고 전기', '봉고 EV'],
    aliases: ['봉고3', '봉고 3', '봉고Ⅲ', '봉고III', '봉고', '봉고 디젤', '봉고 LPG', '봉고 전기', '봉고 전기차', '봉고3 EV', '봉고 EV', '봉고 일렉트릭', '봉고3 일렉트릭'],
    intentTags: ['vehicle', 'commercial', 'ev'],
    mapTo: { vehicleFamily: '봉고3' },
    notes: '봉고 전기/EV는 일반 봉고3 규격만 보여주지 말고 EV 보조배터리 안내 흐름도 연결.'
  },
  {
    brandGroup: 'kia',
    brandLabel: '기아',
    canonicalName: 'EV6 CV',
    slugHint: 'kia-ev6-cv',
    yearRange: '2021-현재',
    generationCode: 'CV',
    displayAliases: ['EV6', '이브이식스', 'EV6 보조배터리'],
    aliases: ['EV6', 'ev6', '이브이6', '이브이식스', 'EV6 보조배터리', 'EV6 12V', 'EV6 배터리'],
    intentTags: ['vehicle', 'ev', 'aux_battery'],
    mapTo: { vehicleFamily: 'EV6', generation: 'CV', fuel: 'ev' }
  },

  // =========================================================
  // GENESIS - 제네시스
  // =========================================================
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: '제네시스 DH',
    slugHint: 'genesis-dh',
    yearRange: '2013-2016',
    generationCode: 'DH',
    displayAliases: ['제네시스 DH', '현대 제네시스', '제네시스 2세대'],
    aliases: ['제네시스DH', 'DH제네시스', '현대 제네시스', '현대제네시스', '제네시스 2세대', '제네시스 세단 DH', '제네시스 15년식', '제네시스 16년식'],
    intentTags: ['vehicle', 'generation', 'agm105l'],
    mapTo: { vehicleFamily: '제네시스', generation: 'DH' },
    notes: 'Battery Manager 기준 DH/EQ900/G80 일부는 AGM105L 계열 검수 필요.'
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'G80 DH',
    slugHint: 'genesis-g80-dh',
    yearRange: '2016-2020',
    generationCode: 'DH',
    displayAliases: ['G80 1세대', '제네시스 G80 DH', 'G80 스포츠'],
    aliases: ['G80', 'g80', '제네시스G80', '제네시스 G80', 'G80DH', 'DH G80', 'G80 스포츠', 'G80스포츠', 'G80 17년식', 'G80 18년식', 'G80 19년식'],
    intentTags: ['vehicle', 'generation', 'agm105l'],
    mapTo: { vehicleFamily: 'G80', generation: 'DH' }
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'G80 RG3',
    slugHint: 'genesis-g80-rg3',
    yearRange: '2020-현재',
    generationCode: 'RG3',
    displayAliases: ['G80 RG3', '디 올 뉴 G80', '신형 G80'],
    aliases: ['G80RG3', 'RG3 G80', '디올뉴G80', '디 올 뉴 G80', '신형 G80', 'G80 2세대', 'G80 전동화', 'G80 전기차', 'Electrified G80'],
    intentTags: ['vehicle', 'generation', 'ev'],
    mapTo: { vehicleFamily: 'G80', generation: 'RG3' }
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'EQ900 / G90 HI',
    slugHint: 'genesis-eq900-g90-hi',
    yearRange: '2015-2021',
    generationCode: 'HI',
    displayAliases: ['EQ900', 'G90 1세대', '제네시스 G90'],
    aliases: ['EQ900', 'eq900', '이큐900', '제네시스 EQ900', '제네시스EQ900', 'G90', 'g90', '제네시스 G90', 'G90 1세대', 'G90 HI', 'G90 리무진', 'EQ900 리무진'],
    intentTags: ['vehicle', 'generation', 'agm105l', 'luxury'],
    mapTo: { vehicleFamily: 'G90', generation: 'HI' },
    notes: 'G90은 연식/단자 방향 혼재 가능성 때문에 배터리 규격 확정 문구 주의.'
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'G70 IK',
    slugHint: 'genesis-g70-ik',
    yearRange: '2017-현재',
    generationCode: 'IK',
    displayAliases: ['G70', '제네시스 G70', '더 뉴 G70'],
    aliases: ['G70', 'g70', '제네시스G70', '제네시스 G70', '더뉴G70', '더 뉴 G70', 'G70 슈팅브레이크', 'G70 왜건'],
    intentTags: ['vehicle', 'generation', 'wagon'],
    mapTo: { vehicleFamily: 'G70', generation: 'IK' }
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'GV60 JW',
    slugHint: 'genesis-gv60-jw',
    yearRange: '2021-현재',
    generationCode: 'JW',
    displayAliases: ['GV60', '제네시스 GV60', 'GV60 전기차'],
    aliases: ['GV60', 'gv60', '제네시스GV60', '제네시스 GV60', 'GV60 전기차', 'GV60 EV', 'GV60 보조배터리'],
    intentTags: ['vehicle', 'ev', 'aux_battery', 'agm60l'],
    mapTo: { vehicleFamily: 'GV60', generation: 'JW', fuel: 'ev' },
    notes: 'Battery Manager 기준 GV60은 AGM60L 매칭 메모 있음.'
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'GV70 JK1',
    slugHint: 'genesis-gv70-jk1',
    yearRange: '2020-현재',
    generationCode: 'JK1',
    displayAliases: ['GV70', '제네시스 GV70', 'GV70 전동화'],
    aliases: ['GV70', 'gv70', '제네시스GV70', '제네시스 GV70', 'GV70 전동화', 'GV70 전기차', 'GV70 EV', 'Electrified GV70'],
    intentTags: ['vehicle', 'generation', 'ev', 'agm80r'],
    mapTo: { vehicleFamily: 'GV70', generation: 'JK1' },
    notes: 'Battery Manager 기준 GV70은 AGM80R.'
  },
  {
    brandGroup: 'genesis',
    brandLabel: '제네시스',
    canonicalName: 'GV80 JX1',
    slugHint: 'genesis-gv80-jx1',
    yearRange: '2020-현재',
    generationCode: 'JX1',
    displayAliases: ['GV80', '제네시스 GV80', 'GV80 쿠페'],
    aliases: ['GV80', 'gv80', '제네시스GV80', '제네시스 GV80', 'GV80 쿠페', 'GV80쿱', 'GV80 Coupe', 'GV80 2.5', 'GV80 3.5', 'GV80 디젤'],
    intentTags: ['vehicle', 'generation', 'coupe', 'diesel', 'agm95r'],
    mapTo: { vehicleFamily: 'GV80', generation: 'JX1' },
    notes: 'Battery Manager 기준 GV80은 AGM95R.'
  },

  // =========================================================
  // CHEVROLET / GM - 쉐보레/GM
  // =========================================================
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '스파크 M300',
    slugHint: 'chevrolet-spark-m300',
    yearRange: '2009-2015',
    generationCode: 'M300',
    displayAliases: ['스파크', '마티즈 크리에이티브', '더 넥스트 스파크 이전'],
    aliases: ['스파크', '쉐보레 스파크', '마티즈 크리에이티브', '마크리', '스파크M300', 'M300스파크'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '스파크', generation: 'M300' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '더 넥스트 스파크 M400',
    slugHint: 'chevrolet-spark-m400',
    yearRange: '2015-2022',
    generationCode: 'M400',
    displayAliases: ['더 넥스트 스파크', '스파크 M400', '더 뉴 스파크'],
    aliases: ['더넥스트스파크', '더 넥스트 스파크', '스파크M400', 'M400스파크', '더뉴스파크', '더 뉴 스파크', '스파크 2세대'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '스파크', generation: 'M400' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '크루즈 J300',
    slugHint: 'chevrolet-cruze-j300',
    yearRange: '2008-2016',
    generationCode: 'J300',
    displayAliases: ['크루즈', '라세티 프리미어', '어메이징 뉴 크루즈'],
    aliases: ['크루즈', '쉐보레 크루즈', '라세티프리미어', '라세티 프리미어', '라프', '크루즈J300', 'J300크루즈', '어메이징뉴크루즈', '어메이징 뉴 크루즈', '크루즈 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '크루즈', generation: 'J300' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '올 뉴 크루즈 D2LC',
    slugHint: 'chevrolet-cruze-d2lc',
    yearRange: '2017-2018',
    generationCode: 'D2LC',
    displayAliases: ['올 뉴 크루즈', '신형 크루즈'],
    aliases: ['올뉴크루즈', '올 뉴 크루즈', '신형 크루즈', '크루즈D2LC', 'D2LC크루즈'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '크루즈', generation: 'D2LC' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '말리부 8세대 V300',
    slugHint: 'chevrolet-malibu-v300',
    yearRange: '2011-2016',
    generationCode: 'V300',
    displayAliases: ['말리부', '말리부 8세대', '더 뉴 말리부 이전'],
    aliases: ['말리부', '쉐보레 말리부', '말리부V300', 'V300말리부', '말리부 8세대', '말리부 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '말리부', generation: 'V300' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '올 뉴 말리부 V400',
    slugHint: 'chevrolet-malibu-v400',
    yearRange: '2016-2022',
    generationCode: 'V400',
    displayAliases: ['올 뉴 말리부', '더 뉴 말리부', '말리부 9세대'],
    aliases: ['올뉴말리부', '올 뉴 말리부', '더뉴말리부', '더 뉴 말리부', '말리부V400', 'V400말리부', '말리부 9세대', '말리부 하이브리드'],
    intentTags: ['vehicle', 'generation', 'facelift', 'hev'],
    mapTo: { vehicleFamily: '말리부', generation: 'V400' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '트랙스 1세대',
    slugHint: 'chevrolet-trax-1st',
    yearRange: '2013-2022',
    displayAliases: ['트랙스', '더 뉴 트랙스'],
    aliases: ['트랙스', '쉐보레 트랙스', '더뉴트랙스', '더 뉴 트랙스', '트랙스 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '트랙스', generation: '1세대' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '트랙스 크로스오버',
    slugHint: 'chevrolet-trax-crossover',
    yearRange: '2023-현재',
    displayAliases: ['트랙스 크로스오버', '신형 트랙스'],
    aliases: ['트랙스 크로스오버', '트랙스크로스오버', '신형 트랙스', '트랙스 CUV', '트랙스CUV'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '트랙스', generation: '크로스오버' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '트레일블레이저',
    slugHint: 'chevrolet-trailblazer',
    yearRange: '2020-현재',
    displayAliases: ['트레일블레이저', '트블', '쉐보레 트레일블레이저'],
    aliases: ['트레일블레이저', '트레일 블레이저', '트블', '쉐보레 트레일블레이저', '쉐보레 트블', '트레일블레이저 RS'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: '트레일블레이저' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '올란도',
    slugHint: 'chevrolet-orlando',
    yearRange: '2011-2018',
    displayAliases: ['올란도', '쉐보레 올란도', '올란도 LPG'],
    aliases: ['올란도', '쉐보레 올란도', '올란도 LPG', '올란도 디젤'],
    intentTags: ['vehicle', 'lpg', 'diesel'],
    mapTo: { vehicleFamily: '올란도' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '캡티바',
    slugHint: 'chevrolet-captiva',
    yearRange: '2011-2018',
    displayAliases: ['캡티바', '윈스톰', '쉐보레 캡티바'],
    aliases: ['캡티바', '쉐보레 캡티바', '윈스톰', '윈스톰 맥스', '캡티바 디젤'],
    intentTags: ['vehicle', 'diesel'],
    mapTo: { vehicleFamily: '캡티바' }
  },
  {
    brandGroup: 'chevrolet_gm',
    brandLabel: '쉐보레/GM',
    canonicalName: '볼트 EV',
    slugHint: 'chevrolet-bolt-ev',
    yearRange: '2017-현재',
    displayAliases: ['볼트 EV', '볼트 전기차', 'Bolt EV'],
    aliases: ['볼트EV', '볼트 EV', '볼트 전기', '볼트 전기차', 'Bolt EV', 'bolt ev', '볼트 보조배터리', '볼트 12V'],
    intentTags: ['vehicle', 'ev', 'aux_battery'],
    mapTo: { vehicleFamily: '볼트 EV', fuel: 'ev' }
  },

  // =========================================================
  // RENAULT SAMSUNG / RENAULT KOREA - 르노/르노삼성
  // =========================================================
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'SM3 뉴 제너레이션 / L38',
    slugHint: 'renault-sm3-l38',
    yearRange: '2009-2020',
    generationCode: 'L38',
    displayAliases: ['SM3', '뉴 SM3', 'SM3 네오'],
    aliases: ['SM3', 'sm3', '에스엠3', '뉴SM3', '뉴 SM3', 'SM3 네오', 'SM3네오', 'SM3 L38', 'L38 SM3', 'SM3 ZE', 'SM3 Z.E.', 'SM3 전기'],
    intentTags: ['vehicle', 'generation', 'ev'],
    mapTo: { vehicleFamily: 'SM3', generation: 'L38' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'SM5 임프레션 / 뉴 SM5',
    slugHint: 'renault-sm5',
    yearRange: '2005-2019',
    displayAliases: ['SM5', '뉴 SM5', 'SM5 노바', 'SM5 임프레션'],
    aliases: ['SM5', 'sm5', '에스엠5', '뉴SM5', '뉴 SM5', 'SM5 임프레션', 'SM5임프레션', 'SM5 노바', 'SM5노바', 'SM5 플래티넘', 'SM5플래티넘', 'SM5 LPG', 'SM5 디젤'],
    intentTags: ['vehicle', 'generation', 'lpg', 'diesel'],
    mapTo: { vehicleFamily: 'SM5' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'SM6 LFD',
    slugHint: 'renault-sm6-lfd',
    yearRange: '2016-현재',
    generationCode: 'LFD',
    displayAliases: ['SM6', '르노삼성 SM6', '더 뉴 SM6'],
    aliases: ['SM6', 'sm6', '에스엠6', '르노삼성 SM6', '르노 SM6', '더뉴SM6', '더 뉴 SM6', 'SM6 LPG', 'SM6 LPe', 'SM6 디젤'],
    intentTags: ['vehicle', 'generation', 'lpg', 'diesel'],
    mapTo: { vehicleFamily: 'SM6', generation: 'LFD' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'SM7 / 올 뉴 SM7',
    slugHint: 'renault-sm7',
    yearRange: '2004-2020',
    displayAliases: ['SM7', '올 뉴 SM7', 'SM7 노바'],
    aliases: ['SM7', 'sm7', '에스엠7', '올뉴SM7', '올 뉴 SM7', 'SM7 노바', 'SM7노바', '뉴아트', 'SM7 뉴아트'],
    intentTags: ['vehicle', 'generation'],
    mapTo: { vehicleFamily: 'SM7' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'QM3',
    slugHint: 'renault-qm3',
    yearRange: '2013-2019',
    displayAliases: ['QM3', '르노삼성 QM3', '캡처 이전 QM3'],
    aliases: ['QM3', 'qm3', '큐엠3', '르노삼성 QM3', 'QM3 디젤'],
    intentTags: ['vehicle', 'diesel'],
    mapTo: { vehicleFamily: 'QM3' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'XM3 / 아르카나',
    slugHint: 'renault-xm3-arkana',
    yearRange: '2020-현재',
    displayAliases: ['XM3', '르노 XM3', '아르카나'],
    aliases: ['XM3', 'xm3', '엑스엠3', '르노삼성 XM3', '르노 XM3', '아르카나', '르노 아르카나', 'XM3 하이브리드', 'XM3 E-TECH', 'XM3 이테크'],
    intentTags: ['vehicle', 'hev'],
    mapTo: { vehicleFamily: 'XM3/아르카나' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'QM5',
    slugHint: 'renault-qm5',
    yearRange: '2007-2016',
    displayAliases: ['QM5', '뉴 QM5', '르노삼성 QM5'],
    aliases: ['QM5', 'qm5', '큐엠5', '뉴QM5', '뉴 QM5', 'QM5 디젤', 'QM5 가솔린'],
    intentTags: ['vehicle', 'diesel', 'gasoline'],
    mapTo: { vehicleFamily: 'QM5' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: 'QM6',
    slugHint: 'renault-qm6',
    yearRange: '2016-현재',
    displayAliases: ['QM6', '더 뉴 QM6', '뉴 QM6', 'QM6 Quest'],
    aliases: ['QM6', 'qm6', '큐엠6', '르노삼성 QM6', '르노 QM6', '더뉴QM6', '더 뉴 QM6', '뉴QM6', '뉴 QM6', 'QM6 LPG', 'QM6 LPe', 'QM6 디젤', 'QM6 가솔린', 'QM6 퀘스트', 'QM6 Quest', 'QM6 밴'],
    intentTags: ['vehicle', 'lpg', 'diesel', 'gasoline', 'van'],
    mapTo: { vehicleFamily: 'QM6' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: '르노 캡처',
    slugHint: 'renault-captur',
    yearRange: '2020-2022',
    displayAliases: ['캡처', '르노 캡처', '르노삼성 캡처'],
    aliases: ['캡처', '캡쳐', '르노 캡처', '르노 캡쳐', '르노삼성 캡처', '르노삼성 캡쳐', 'Captur', 'captur'],
    intentTags: ['vehicle', 'diesel', 'gasoline'],
    mapTo: { vehicleFamily: '캡처' }
  },
  {
    brandGroup: 'renault_samsung',
    brandLabel: '르노/르노삼성',
    canonicalName: '르노 마스터',
    slugHint: 'renault-master',
    yearRange: '2018-현재',
    displayAliases: ['마스터', '르노 마스터', '마스터 밴'],
    aliases: ['마스터', '르노 마스터', '마스터 밴', '마스터 버스', '르노마스터', '르노마스터밴', '르노마스터버스'],
    intentTags: ['vehicle', 'commercial', 'van', 'bus'],
    mapTo: { vehicleFamily: '마스터' }
  },

  // =========================================================
  // KGM / SSANGYONG - 쌍용/KGM
  // =========================================================
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '티볼리 1세대',
    slugHint: 'kgm-tivoli-1st',
    yearRange: '2015-현재',
    displayAliases: ['티볼리', '티볼리 아머', '베리 뉴 티볼리', '더 뉴 티볼리'],
    aliases: ['티볼리', 'tivoli', 'Tivoli', '쌍용 티볼리', 'KGM 티볼리', '티볼리 아머', '티볼리아머', '베리뉴티볼리', '베리 뉴 티볼리', '베리뉴 티볼리', '더뉴티볼리', '더 뉴 티볼리', '티볼리 20년식', '20년식 티볼리'],
    intentTags: ['vehicle', 'generation', 'facelift'],
    mapTo: { vehicleFamily: '티볼리', generation: '1세대' },
    notes: '20년식 티볼리는 베리 뉴 티볼리 계열로 우선 인식.'
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '티볼리 에어',
    slugHint: 'kgm-tivoli-air',
    yearRange: '2016-현재',
    displayAliases: ['티볼리 에어', '티볼리에어', '티볼리 롱바디'],
    aliases: ['티볼리에어', '티볼리 에어', '티볼리Air', 'Tivoli Air', '티볼리 롱바디', '티볼리롱바디', '베리뉴 티볼리 에어', '베리뉴티볼리에어'],
    intentTags: ['vehicle', 'derivative', 'long_body'],
    mapTo: { vehicleFamily: '티볼리', trimOrDerivative: '에어' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '코란도 C',
    slugHint: 'kgm-korando-c',
    yearRange: '2011-2019',
    displayAliases: ['코란도 C', '뉴 코란도 C', '더 뉴 코란도 C'],
    aliases: ['코란도C', '코란도 C', '뉴코란도C', '뉴 코란도 C', '더뉴코란도C', '더 뉴 코란도 C', '코씨', 'Korando C', '코란도C 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '코란도', generation: 'C' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '뷰티풀 코란도 C300',
    slugHint: 'kgm-korando-c300',
    yearRange: '2019-현재',
    generationCode: 'C300',
    displayAliases: ['뷰티풀 코란도', '코란도 C300', '신형 코란도'],
    aliases: ['뷰티풀코란도', '뷰티풀 코란도', '코란도C300', 'C300코란도', '신형 코란도', '코란도 2019', '코란도 20년식', '코란도 가솔린', '코란도 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel', 'gasoline'],
    mapTo: { vehicleFamily: '코란도', generation: 'C300' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '코란도 스포츠',
    slugHint: 'kgm-korando-sports',
    yearRange: '2012-2018',
    displayAliases: ['코란도 스포츠', '코스', '코란도 픽업'],
    aliases: ['코란도스포츠', '코란도 스포츠', '코스', '코란도 픽업', '쌍용 픽업', '코란도 스포츠 2.0'],
    intentTags: ['vehicle', 'pickup', 'commercial', 'diesel'],
    mapTo: { vehicleFamily: '코란도 스포츠' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '렉스턴 W / G4 렉스턴',
    slugHint: 'kgm-rexton-g4',
    yearRange: '2012-2020',
    displayAliases: ['렉스턴 W', 'G4 렉스턴', '올 뉴 렉스턴 이전'],
    aliases: ['렉스턴W', '렉스턴 W', 'G4렉스턴', 'G4 렉스턴', '지포렉스턴', '렉스턴 2세대', '렉스턴 디젤'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '렉스턴', generation: 'G4/W' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '올 뉴 렉스턴 Y450',
    slugHint: 'kgm-rexton-y450',
    yearRange: '2020-현재',
    generationCode: 'Y450',
    displayAliases: ['올 뉴 렉스턴', '뉴 렉스턴', '렉스턴 Y450'],
    aliases: ['올뉴렉스턴', '올 뉴 렉스턴', '뉴렉스턴', '뉴 렉스턴', '렉스턴Y450', 'Y450렉스턴', '렉스턴 써밋', '렉스턴 스포츠 아님'],
    intentTags: ['vehicle', 'generation', 'diesel'],
    mapTo: { vehicleFamily: '렉스턴', generation: 'Y450' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '렉스턴 스포츠 Q200',
    slugHint: 'kgm-rexton-sports-q200',
    yearRange: '2018-현재',
    generationCode: 'Q200',
    displayAliases: ['렉스턴 스포츠', '렉스턴스포츠', '렉스턴 픽업'],
    aliases: ['렉스턴스포츠', '렉스턴 스포츠', '렉스포츠', '렉스턴 픽업', '쌍용 렉스턴 스포츠', 'KGM 렉스턴 스포츠', '렉스턴 스포츠 2.2'],
    intentTags: ['vehicle', 'pickup', 'commercial', 'diesel'],
    mapTo: { vehicleFamily: '렉스턴 스포츠', generation: 'Q200' },
    notes: '렉스턴 스포츠 칸과 일반 렉스턴 스포츠는 구분해야 함.'
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '렉스턴 스포츠 칸 Q200/Q250',
    slugHint: 'kgm-rexton-sports-khan',
    yearRange: '2019-현재',
    generationCode: 'Q200/Q250',
    displayAliases: ['렉스턴 스포츠 칸', '렉스턴칸', '렉스턴 스포츠칸', '칸'],
    aliases: ['렉스턴 스포츠 칸', '렉스턴스포츠칸', '렉스턴칸', '렉스턴 칸', '렉스턴 스포츠칸', '칸', '쌍용 칸', 'KGM 칸', '렉스턴 스포츠 롱바디', '렉스턴 롱바디', '칸 쿨멘', '렉스턴 스포츠 칸 쿨멘', '쿨멘'],
    intentTags: ['vehicle', 'pickup', 'commercial', 'long_body', 'diesel'],
    mapTo: { vehicleFamily: '렉스턴 스포츠 칸', generation: 'Q200/Q250', trimOrDerivative: '칸' },
    notes: '렉스턴칸 검색 시 일반 렉스턴 SUV가 먼저 나오면 error.'
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '토레스 J100',
    slugHint: 'kgm-torres-j100',
    yearRange: '2022-현재',
    generationCode: 'J100',
    displayAliases: ['토레스', 'KGM 토레스', '쌍용 토레스'],
    aliases: ['토레스', 'Torres', 'torres', '쌍용 토레스', 'KGM 토레스', '케이지모빌리티 토레스', '토레스 LPG', '토레스 바이퓨얼'],
    intentTags: ['vehicle', 'generation', 'lpg'],
    mapTo: { vehicleFamily: '토레스', generation: 'J100' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '토레스 EVX',
    slugHint: 'kgm-torres-evx',
    yearRange: '2023-현재',
    generationCode: 'U100',
    displayAliases: ['토레스 EVX', '토레스 전기차', 'KGM 토레스 EVX'],
    aliases: ['토레스EVX', '토레스 EVX', '토레스 evx', '토레스 전기', '토레스 전기차', '토레스 EV', 'KGM 토레스 EVX', '쌍용 토레스 EVX', '토레스 보조배터리'],
    intentTags: ['vehicle', 'ev', 'aux_battery'],
    mapTo: { vehicleFamily: '토레스 EVX', generation: 'U100', fuel: 'ev' }
  },
  {
    brandGroup: 'kgm_ssangyong',
    brandLabel: '쌍용/KGM',
    canonicalName: '액티언 / 액티언 스포츠',
    slugHint: 'kgm-actyon-sports',
    yearRange: '2005-2011',
    displayAliases: ['액티언', '액티언 스포츠', '액스'],
    aliases: ['액티언', '액티언스포츠', '액티언 스포츠', '액스', '쌍용 액티언', '액티언 픽업'],
    intentTags: ['vehicle', 'pickup', 'diesel'],
    mapTo: { vehicleFamily: '액티언/액티언 스포츠' }
  }
];

// 검색 엔진 적용용 보조 인덱스 생성 예시
export function buildAliasIndex(entries: VehicleAliasEntry[]) {
  const index: Record<string, VehicleAliasEntry[]> = {};
  for (const entry of entries) {
    const all = new Set([entry.canonicalName, ...entry.displayAliases, ...entry.aliases]);
    for (const rawAlias of all) {
      const normalized = normalizeVehicleAlias(rawAlias);
      if (!normalized) continue;
      if (!index[normalized]) index[normalized] = [];
      index[normalized].push(entry);
    }
  }
  return index;
}

export function normalizeVehicleAlias(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[·ㆍ._\-]/g, '')
    .replace(/Ⅱ/g, 'ii')
    .replace(/Ⅲ/g, 'iii')
    .replace(/그랜져/g, '그랜저')
    .replace(/산타페/g, '싼타페')
    .replace(/소나타/g, '쏘나타')
    .replace(/캡쳐/g, '캡처')
    .replace(/펠리세이드/g, '팰리세이드')
    .trim();
}

// 고객 화면 노출 예시:
// [차량명]
// 고객님들이 보통 이렇게도 검색합니다.
// K3 · 케이쓰리 · K3 쿱 · K3 쿠페 · K3 유로