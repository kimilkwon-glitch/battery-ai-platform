const base = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const slugs = [
  "santafe-mx5",
  "santafe-mx5-hev",
  "kona-sx2",
  "porter2-ev",
  "niro-sg2",
  "bongo3-ev",
  "renault-samsung-qm6-quest-2023",
  "renault-arkana-2024",
  "renault-master-2018",
  "kg-torres-2022",
  "kg-torres-evx-2023",
  "kg-actyon-2024",
  "chevrolet-the-new-cruze-2015",
  "chevrolet-trailblazer-2024",
  "chevrolet-equinox-2022",
  "gmdaewoo-labo-2011",
  "gmdaewoo-damas-2011",
  "chevrolet-bolt-ev-2017",
  "daewoo-tosca-2006",
];

const home = await fetch(base + "/");
const homeHtml = await home.text();
const stamp =
  homeHtml.match(/data-build-version="([^"]+)"/)?.[1] ?? "MISSING";

console.log("production:", base);
console.log("build_stamp:", stamp);
console.log("deployment_probe:", home.headers.get("x-vercel-id") ?? "-");

for (const slug of slugs) {
  const res = await fetch(`${base}/vehicle/${slug}`);
  const html = await res.text();
  const checks = {
    status: res.status,
    noDb: /DB 매칭 없음/.test(html),
    consultOnly: /상담 확인 필요/.test(html) && !/리튬배터리/.test(html),
    orderCta: /주문하기/.test(html),
    lithium: /리튬배터리/.test(html),
    fixedAgm70: /AGM70L 고정/.test(html),
    din74: /DIN74L/.test(html),
    cruzeBranch: /DIN60L/.test(html) && /DIN74L/.test(html),
    tosca80r: /80R/.test(html),
  };
  console.log(slug, JSON.stringify(checks));
}
