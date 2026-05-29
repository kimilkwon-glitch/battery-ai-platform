const STAMP = process.argv[3] || "BM-UX-REV-20260528-OFFICIAL-CHANNELS-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

const [home, service, deokImg, hakImg] = await Promise.all([
  fetchText("/"),
  fetchText("/service-center"),
  fetchText("/assets/stores/deokcheon.jpg"),
  fetchText("/assets/stores/hakjang.jpg"),
]);

console.log(
  JSON.stringify(
    {
      stampOk: home.text.includes(STAMP),
      buildVersion: home.text.match(/data-build-version="([^"]+)"/)?.[1],
      home: {
        status: home.status,
        hasOfficialChannels:
          home.text.includes("공식 운영 채널") || home.text.includes("official-channels"),
        noFakeHrefHash: !home.text.includes('href="#"'),
      },
      service: {
        status: service.status,
        phoneDeokcheon: service.text.includes("010-8339-8316"),
        phoneHakjang: service.text.includes("010-8896-8316"),
        telDeokcheon: service.text.includes("tel:010-8339-8316"),
        telHakjang: service.text.includes("tel:010-8896-8316"),
        storeImagePaths:
          service.text.includes("/assets/stores/deokcheon.jpg") &&
          service.text.includes("/assets/stores/hakjang.jpg"),
      },
      storeImages: {
        deokcheon: { status: deokImg.status, ok: deokImg.status === 200 },
        hakjang: { status: hakImg.status, ok: hakImg.status === 200 },
      },
    },
    null,
    2,
  ),
);
