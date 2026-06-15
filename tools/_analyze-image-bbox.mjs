import sharp from "sharp";

const paths = process.argv.slice(2);

async function analyze(p) {
  const img = sharp(p);
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  let opaque = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const a = data[i + 3];
      if (a > 16) {
        opaque++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  console.log(
    JSON.stringify({
      path: p,
      canvas: `${info.width}x${info.height}`,
      bbox: { minX, minY, maxX, maxY, w: cw, h: ch },
      contentVsCanvas: `${((cw / info.width) * 100).toFixed(1)}% x ${((ch / info.height) * 100).toFixed(1)}%`,
      bboxAreaPct: ((cw * ch) / (info.width * info.height)) * 100,
      opaquePct: (opaque / (info.width * info.height)) * 100,
    }),
  );
}

for (const p of paths) {
  await analyze(p);
}
