const base = "https://battery-ai-platform.vercel.app";
const paths = ["/", "/cart", "/support", "/order-request", "/admin/login"];

for (const p of paths) {
  const res = await fetch(`${base}${p}?_cb=v15`, {
    redirect: "manual",
    headers: { "User-Agent": "BM-V15" },
  });
  const ct = res.headers.get("content-type") ?? "";
  let extra = "";
  if (p === "/" && ct.includes("html")) {
    const t = await res.text();
    const v = t.match(/data-build-version="([^"]+)"/);
    extra = ` build=${v?.[1] ?? "n/a"} cartLink=${t.includes("/cart")}`;
  }
  console.log(p, res.status, res.headers.get("x-vercel-id") ?? "-", extra);
}
