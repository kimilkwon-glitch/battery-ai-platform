#!/usr/bin/env node
/**
 * 테스트 5대 reference 후보 URL 수집 (다운로드 금지)
 * 저장: reports/vehicle-reference-candidates-test5.json|.md
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MASTER_LIST = path.join(ROOT, "data", "vehicle-registry-image-master-list.json");
const MAX_PER_VEHICLE = 5;
const FETCH_TIMEOUT_MS = 8000;

const TEST_SLUGS = [
  "tucson-jm",
  "ssangyong-tivoli-air-2016",
  "ssangyong-tivoli-armour-2017",
  "kia-k9-2012",
  "chevrolet-cruze-2011",
];

const SEARCH_QUERIES = {
  "tucson-jm": [
    "Hyundai Tucson JM 2004 2009 front three quarter",
    "first generation Hyundai Tucson JM press photo",
    "현대 투싼 JM 2004 2009 전면 측면",
    "투싼 JM 전면 45도",
  ],
  "ssangyong-tivoli-air-2016": [
    "SsangYong Tivoli Air 2016 front three quarter",
    "SsangYong Tivoli XLV 2016 press photo",
    "쌍용 티볼리 에어 2016 전면 측면",
    "티볼리 에어 XLV 2016 이미지",
  ],
  "ssangyong-tivoli-armour-2017": [
    "SsangYong Tivoli Armour 2017 front three quarter",
    "SsangYong Tivoli 2017 facelift front three quarter",
    "쌍용 티볼리 아머 2017 전면 측면",
  ],
  "kia-k9-2012": [
    "Kia K9 2012 first generation front three quarter",
    "Kia K900 2012 press photo",
    "기아 K9 2012 1세대 전면 측면",
  ],
  "chevrolet-cruze-2011": [
    "Chevrolet Cruze 2011 first generation front three quarter",
    "Chevrolet Cruze J300 2011 sedan press photo",
    "쉐보레 크루즈 2011 전면 측면",
  ],
};

/** netcarshow 갤러리 1회 fetch (실패 시 skip) */
const NETCARSHOW_PAGES = {
  "ssangyong-tivoli-air-2016": "https://www.netcarshow.com/ssangyong/2017-tivoli_xlv/",
  "ssangyong-tivoli-armour-2017": "https://www.netcarshow.com/ssangyong/2016-tivoli/",
  "kia-k9-2012": "https://www.netcarshow.com/kia/2015-k900/",
  "chevrolet-cruze-2011": "https://www.netcarshow.com/chevrolet/2011-cruze/",
};

const CURATED_SEEDS = {
  "tucson-jm": [
    {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/2005_Hyundai_Tucson.jpg",
      thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2005_Hyundai_Tucson.jpg/960px-2005_Hyundai_Tucson.jpg",
      sourcePageUrl: "https://commons.wikimedia.org/wiki/File:2005_Hyundai_Tucson.jpg",
      sourceTitle: "2005 Hyundai Tucson (JM) front three-quarter",
      searchQuery: "first generation Hyundai Tucson JM press photo",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/8/8f/Hyundai_Tucson_2.0_CRDi_%28JM%29_%E2%80%93_Frontansicht%2C_14._M%C3%A4rz_2011%2C_W%C3%BClfrath.jpg",
      thumbnailUrl: null,
      sourcePageUrl:
        "https://commons.wikimedia.org/wiki/File:Hyundai_Tucson_2.0_CRDi_(JM)_%E2%80%93_Frontansicht,_14._M%C3%A4rz_2011,_W%C3%BClfrath.jpg",
      sourceTitle: "Hyundai Tucson JM front view",
      searchQuery: "Hyundai Tucson JM 2004 2009 front three quarter",
      angleHint: "front",
    },
    {
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hyundai_Tucson_GL_2.0_2006_%2814344685561%29.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Hyundai_Tucson_GL_2.0_2006_(14344685561).jpg",
      sourceTitle: "Hyundai Tucson GL 2.0 2006 (JM)",
      searchQuery: "현대 투싼 JM 2004 2009 전면 측면",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/c/c9/2007-2010_Hyundai_Tucson_City_Elite_wagon_02.jpg",
      thumbnailUrl: null,
      sourcePageUrl:
        "https://commons.wikimedia.org/wiki/File:2007-2010_Hyundai_Tucson_City_Elite_wagon_02.jpg",
      sourceTitle: "2007-2010 Hyundai Tucson City Elite (JM) — rear three-quarter (angle caution)",
      searchQuery: "투싼 JM 전면 45도",
      angleHint: "rear-three-quarter",
    },
    {
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/1/1b/Hyundai_Tucson_%28JM%29_%E2%80%93_Frontansicht%2C_10._April_2011%2C_D%C3%BCsseldorf.jpg",
      thumbnailUrl: null,
      sourcePageUrl:
        "https://commons.wikimedia.org/wiki/Category:Hyundai_Tucson_(JM)",
      sourceTitle: "Hyundai Tucson JM front (Düsseldorf)",
      searchQuery: "Hyundai Tucson JM 2004 2009 front three quarter",
      angleHint: "front",
    },
  ],
  "ssangyong-tivoli-air-2016": [
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-Front_Three-Quarter.f428cdce.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-1280-9c7114f74291f662ef03082f1017653662.jpg",
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2017-tivoli_xlv/",
      sourceTitle: "SsangYong Tivoli XLV 2016-2017 Front Three-Quarter press",
      searchQuery: "SsangYong Tivoli XLV 2016 press photo",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-1280-9c7114f74291f662ef03082f1017653662.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2017-tivoli_xlv/",
      sourceTitle: "SsangYong Tivoli XLV 2017 front three-quarter thumbnail",
      searchQuery: "SsangYong Tivoli Air 2016 front three quarter",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-Front.f428cdce.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-1280-132adc0a719406d605d24d08e0faf30199.jpg",
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2017-tivoli_xlv/",
      sourceTitle: "SsangYong Tivoli XLV front press",
      searchQuery: "티볼리 에어 XLV 2016 이미지",
      angleHint: "front",
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli-2016-Front_Three-Quarter.64c86b50.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/SsangYong-Tivoli-2016-1280-5e0960ca32fbf1c197ccb6bf20664c6dfd.jpg",
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2016-tivoli/",
      sourceTitle: "SsangYong Tivoli 2016 front three-quarter (base Tivoli, not XLV)",
      searchQuery: "쌍용 티볼리 에어 2016 전면 측면",
      angleHint: "front-three-quarter",
      generationMismatch: true,
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-wallpaper.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2017-tivoli_xlv/",
      sourceTitle: "SsangYong Tivoli XLV wallpaper",
      searchQuery: "SsangYong Tivoli Air 2016 front three quarter",
      angleHint: "front-three-quarter",
    },
  ],
  "ssangyong-tivoli-armour-2017": [
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli-2016-Front_Three-Quarter.64c86b50.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/SsangYong-Tivoli-2016-1280-5e0960ca32fbf1c197ccb6bf20664c6dfd.jpg",
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2016-tivoli/",
      sourceTitle: "SsangYong Tivoli 2016 facelift front three-quarter",
      searchQuery: "SsangYong Tivoli 2017 facelift front three quarter",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli-2016-1280-5e0960ca32fbf1c197ccb6bf20664c6dfd.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2016-tivoli/",
      sourceTitle: "SsangYong Tivoli 2016 front three-quarter thumbnail",
      searchQuery: "SsangYong Tivoli Armour 2017 front three quarter",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli-2016-Front.64c86b50.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2016-tivoli/",
      sourceTitle: "SsangYong Tivoli 2016 front press",
      searchQuery: "쌍용 티볼리 아머 2017 전면 측면",
      angleHint: "front",
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli-2020-Front_Three-Quarter.1ca84e97.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/SsangYong-Tivoli-2020-1280-334f848644890c4d5c2f3cade0a0a5ba40.jpg",
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2020-tivoli/",
      sourceTitle: "SsangYong Tivoli 2020 front three-quarter (newer gen — caution)",
      searchQuery: "SsangYong Tivoli Armour 2017 front three quarter",
      angleHint: "front-three-quarter",
      generationMismatch: true,
    },
    {
      imageUrl: "https://www.netcarshow.com/SsangYong-Tivoli_XLV-2017-Front_Three-Quarter.f428cdce.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/ssangyong/2017-tivoli_xlv/",
      sourceTitle: "SsangYong Tivoli XLV (wrong variant — Air not Armour)",
      searchQuery: "SsangYong Tivoli Armour 2017 front three quarter",
      angleHint: "front-three-quarter",
      generationMismatch: true,
    },
  ],
  "kia-k9-2012": [
    {
      imageUrl: "https://www.netcarshow.com/Kia-K900-2015-Front_Three-Quarter.e72bcd50.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/Kia-K900-2015-1280-91fbbaeb59fe37bd0b3a6920901437d61a.jpg",
      sourcePageUrl: "https://www.netcarshow.com/kia/2015-k900/",
      sourceTitle: "Kia K900 2015 front three-quarter press (K9 1st gen)",
      searchQuery: "Kia K900 2012 press photo",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/Kia-K900-2015-1280-91fbbaeb59fe37bd0b3a6920901437d61a.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/kia/2015-k900/",
      sourceTitle: "Kia K900 2015 front three-quarter thumbnail",
      searchQuery: "Kia K9 2012 first generation front three quarter",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/Kia-K900-2015-Front.e72bcd50.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/kia/2015-k900/",
      sourceTitle: "Kia K900 2015 front press",
      searchQuery: "기아 K9 2012 1세대 전면 측면",
      angleHint: "front",
    },
    {
      imageUrl:
        "https://media.ed.edmunds-media.com/kia/k900/2015/oem/2015_kia_k900_sedan_v8_fq_oem_2_175.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.edmunds.com/kia/k900/2015/review/",
      sourceTitle: "2015 Kia K900 OEM front quarter (Edmunds)",
      searchQuery: "Kia K9 2012 first generation front three quarter",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl:
        "https://media.ed.edmunds-media.com/kia/k900/2015/oem/2015_kia_k900_sedan_v8_fq_oem_3_175.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.edmunds.com/kia/k900/2015/review/",
      sourceTitle: "2015 Kia K900 OEM front quarter alt",
      searchQuery: "Kia K900 2012 press photo",
      angleHint: "front-three-quarter",
    },
  ],
  "chevrolet-cruze-2011": [
    {
      imageUrl: "https://www.netcarshow.com/Chevrolet-Cruze-2011-Front_Three-Quarter.966192d2.jpg",
      thumbnailUrl:
        "https://www.netcarshow.com/Chevrolet-Cruze-2011-1280-ec504a8b98019a06887a906dc1b02bf39f.jpg",
      sourcePageUrl: "https://www.netcarshow.com/chevrolet/2011-cruze/",
      sourceTitle: "Chevrolet Cruze 2011 J300 front three-quarter press",
      searchQuery: "Chevrolet Cruze 2011 first generation front three quarter",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl:
        "https://www.netcarshow.com/Chevrolet-Cruze-2011-1280-ec504a8b98019a06887a906dc1b02bf39f.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/chevrolet/2011-cruze/",
      sourceTitle: "Chevrolet Cruze 2011 front three-quarter thumbnail",
      searchQuery: "Chevrolet Cruze J300 2011 sedan press photo",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl: "https://www.netcarshow.com/Chevrolet-Cruze-2011-Front.966192d2.jpg",
      thumbnailUrl: null,
      sourcePageUrl: "https://www.netcarshow.com/chevrolet/2011-cruze/",
      sourceTitle: "Chevrolet Cruze 2011 front press",
      searchQuery: "쉐보레 크루즈 2011 전면 측면",
      angleHint: "front",
    },
    {
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/4/4d/2012_Chevrolet_Cruze_LT_%28Australia%29_sedan_%281%29.jpg",
      thumbnailUrl: null,
      sourcePageUrl:
        "https://commons.wikimedia.org/wiki/File:2012_Chevrolet_Cruze_LT_(Australia)_sedan_(1).jpg",
      sourceTitle: "2012 Chevrolet Cruze LT sedan front three-quarter",
      searchQuery: "Chevrolet Cruze J300 2011 sedan press photo",
      angleHint: "front-three-quarter",
    },
    {
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/9/9e/2011_Chevrolet_Cruze_%28J300%29_sedan_%28Australia%29_%281%29.jpg",
      thumbnailUrl: null,
      sourcePageUrl:
        "https://commons.wikimedia.org/wiki/File:2011_Chevrolet_Cruze_(J300)_sedan_(Australia)_(1).jpg",
      sourceTitle: "2011 Chevrolet Cruze J300 sedan",
      searchQuery: "Chevrolet Cruze 2011 first generation front three quarter",
      angleHint: "front-three-quarter",
    },
  ],
};

const EXCLUDE = /interior|dashboard|engine|trunk|rear view|accident|wreck|tuning|wrap/i;
const THREE_Q = /three.?quarter|3.?4|45|front.?left|front three/i;
const FRONT_ONLY = /frontansicht|front view| straight front|_front\./i;
const REAR = /rear|heck|back view/i;

function scoreCandidate(c, row) {
  let score = 0;
  const title = `${c.sourceTitle ?? ""} ${c.imageUrl ?? ""} ${c.angleHint ?? ""}`;
  if (EXCLUDE.test(title)) return -100;
  if (c.generationMismatch) score -= 20;
  if (c.angleHint?.includes("rear") || REAR.test(title)) score -= 80;
  else if (THREE_Q.test(title) || c.angleHint === "front-three-quarter") score += 35;
  else if (FRONT_ONLY.test(title) || c.angleHint === "front") score += 8;
  else score += 12;

  if (/netcarshow\.com/i.test(c.imageUrl ?? "")) score += 8;
  if (/edmunds-media\.com/i.test(c.imageUrl ?? "")) score += 5;

  const hints = {
    "tucson-jm": /tucson|투싼|jm/i,
    "ssangyong-tivoli-air-2016": /tivoli|xlv|air|티볼리/i,
    "ssangyong-tivoli-armour-2017": /tivoli|armour|아머/i,
    "kia-k9-2012": /k9|k900|quoris/i,
    "chevrolet-cruze-2011": /cruze|크루즈|j300/i,
  };
  if (hints[row.slug]?.test(title)) score += 12;

  const y = row.representativeYear ?? row.yearFrom;
  if (y && new RegExp(String(y)).test(title)) score += 5;

  return score;
}

function confidenceFromScore(score) {
  if (score >= 40) return "HIGH";
  if (score >= 20) return "MEDIUM";
  return "LOW";
}

async function fetchNetcarshowExtras(pageUrl, searchQuery) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(pageUrl, {
      signal: ctrl.signal,
      headers: { "User-Agent": "battery-ai-platform-ref-url-collector/2.0" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const found = new Set();
    const out = [];
    for (const m of html.matchAll(/data-src="(\/[^"]+\.jpg)"/gi)) {
      const rel = m[1];
      const full = rel.startsWith("http") ? rel : `https://www.netcarshow.com${rel}`;
      if (found.has(full)) continue;
      found.add(full);
      const title = rel.includes("Front_Three-Quarter")
        ? "NetCarShow front three-quarter"
        : rel.includes("Front")
          ? "NetCarShow front"
          : "NetCarShow gallery";
      out.push({
        imageUrl: full,
        thumbnailUrl: null,
        sourcePageUrl: pageUrl,
        sourceTitle: title,
        searchQuery,
        angleHint: rel.includes("Three-Quarter") ? "front-three-quarter" : "unknown",
      });
      if (out.length >= 3) break;
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function pickTop5(candidates, row) {
  const merged = new Map();
  for (const c of candidates) {
    if (!c?.imageUrl) continue;
    const key = c.imageUrl.split("?")[0];
    if (!merged.has(key)) merged.set(key, c);
  }
  return [...merged.values()]
    .map((c) => {
      const score = scoreCandidate(c, row);
      return {
        ...c,
        score,
        confidence: confidenceFromScore(score),
        reason: `score=${score}; ${c.angleHint ?? "angle unknown"}${c.generationMismatch ? "; generation mismatch possible" : ""}`,
      };
    })
    .filter((c) => c.score > -10)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PER_VEHICLE);
}

async function collectVehicle(row) {
  const searchQueries = SEARCH_QUERIES[row.slug] ?? [];
  const seeds = CURATED_SEEDS[row.slug] ?? [];
  let extras = [];
  const page = NETCARSHOW_PAGES[row.slug];
  if (page) {
    extras = await fetchNetcarshowExtras(page, searchQueries[0] ?? row.slug);
  }

  const candidateImages = pickTop5([...seeds, ...extras], row);
  const selected = candidateImages[0] ?? null;

  return {
    slug: row.slug,
    brand: row.brand,
    imageFile: row.imageFile,
    vehicleNameKo: row.vehicleNameKo,
    vehicleNameEn: row.vehicleNameEn,
    generationCode: row.generationCode,
    representativeYear: row.representativeYear,
    bodyType: row.bodyType,
    searchQueries,
    candidateImages,
    selectedReferenceUrl: selected?.imageUrl ?? null,
    selectedReferenceReason: selected
      ? `${selected.confidence} confidence; ${selected.reason}; title: ${selected.sourceTitle}`
      : null,
    needsManualReview: !selected || selected.confidence !== "HIGH" || Boolean(selected.generationMismatch),
  };
}

function renderMd(report) {
  const lines = [
    "# Vehicle Reference Candidate URLs — Test 5",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: URL-only (no download)`,
    "",
    "## Summary",
    "",
    "| Slug | Candidates | Selected URL | Manual review |",
    "|------|------------|--------------|---------------|",
  ];
  for (const v of report.vehicles) {
    const sel = v.selectedReferenceUrl ? "yes" : "—";
    lines.push(
      `| ${v.slug} | ${v.candidateImages.length} | ${sel} | ${v.needsManualReview ? "YES" : "no"} |`,
    );
  }
  lines.push("", "## Per vehicle", "");
  for (const v of report.vehicles) {
    lines.push(`### ${v.slug} (${v.vehicleNameKo})`, "");
    lines.push(`**Selected:** ${v.selectedReferenceUrl ?? "none"}`);
    lines.push(`**Reason:** ${v.selectedReferenceReason ?? "—"}`, "");
    lines.push("| # | Confidence | imageUrl | reason |");
    lines.push("|---|------------|----------|--------|");
    v.candidateImages.forEach((c, i) => {
      lines.push(`| ${i + 1} | ${c.confidence} | ${c.imageUrl} | ${c.reason.replace(/\|/g, "/")} |`);
    });
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  mkdirSync(path.join(ROOT, "reports"), { recursive: true });
  mkdirSync(path.join(ROOT, "public", "assets", "vehicle-reference-candidates"), { recursive: true });
  mkdirSync(path.join(ROOT, "public", "assets", "cars-generated-review", "reference-based"), {
    recursive: true,
  });

  const master = JSON.parse(readFileSync(MASTER_LIST, "utf8"));
  const rowsBySlug = new Map((master.rows ?? []).map((r) => [r.slug, r]));

  const vehicles = [];
  for (const slug of TEST_SLUGS) {
    const row = rowsBySlug.get(slug);
    if (!row) {
      console.error(`[skip] ${slug}: not in master list`);
      continue;
    }
    console.log(`[collect-url] ${slug}...`);
    const result = await collectVehicle(row);
    vehicles.push(result);
    console.log(
      `  candidates=${result.candidateImages.length} selected=${result.selectedReferenceUrl ? "yes" : "no"}`,
    );
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: "url-only",
    downloadPolicy: "no-download",
    testSlugs: TEST_SLUGS,
    maxCandidatesPerVehicle: MAX_PER_VEHICLE,
    vehicles,
  };

  const jsonOut = path.join(ROOT, "reports", "vehicle-reference-candidates-test5.json");
  const mdOut = path.join(ROOT, "reports", "vehicle-reference-candidates-test5.md");
  writeFileSync(jsonOut, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(mdOut, renderMd(report), "utf8");
  console.log(`\nReport: ${jsonOut}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
