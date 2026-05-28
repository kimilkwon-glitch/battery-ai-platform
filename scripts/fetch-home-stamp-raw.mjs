const URL = process.argv[2] || "https://battery-ai-platform.vercel.app/";

function extractStamps(html) {
  const attrs = [...html.matchAll(/data-build-version="([^"]+)"/g)].map((m) => m[1]);
  const footerMono = html.match(/font-mono[^>]*data-build-version="([^"]+)"/)?.[1] ?? null;
  const buildStampDiv = html.match(/data-build-version="([^"]+)"[^>]*aria-hidden/)?.[1] ?? null;
  const all = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) || [])];
  return { attrs: [...new Set(attrs)], footerMono, buildStampDiv, all };
}

async function probe(label, headers) {
  const res = await fetch(URL, { headers, redirect: "follow" });
  const html = await res.text();
  const stamps = extractStamps(html);
  const htmlOpen = html.match(/<html[^>]{0,500}>/)?.[0] ?? "";
  const bodyOpen = html.match(/<body[^>]{0,500}>/)?.[0] ?? "";
  const footerSnippet =
    html.match(/font-mono[^<]{0,120}v BM-UX-REV-[^<]{0,80}/)?.[0] ??
    html.match(/v BM-UX-REV-[A-Z0-9-]+/)?.[0] ??
    null;
  return {
    label,
    status: res.status,
    age: res.headers.get("age"),
    cacheControl: res.headers.get("cache-control"),
    xVercelCache: res.headers.get("x-vercel-cache"),
    xVercelId: res.headers.get("x-vercel-id"),
    ...stamps,
    htmlOpen,
    bodyOpen,
    footerSnippet,
    attrsUnified: stamps.attrs.length === 1 && stamps.attrs[0],
  };
}

const normal = await probe("normal", {});
const nocache = await probe("no-cache", { "Cache-Control": "no-cache", Pragma: "no-cache" });
console.log(JSON.stringify({ url: URL, at: new Date().toISOString(), normal, nocache }, null, 2));
