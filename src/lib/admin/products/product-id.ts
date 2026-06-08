export function encodeProductId(brand: string, batteryCode: string): string {
  return `${brand}:${batteryCode}`;
}

export function decodeProductId(productId: string): { brand: string; batteryCode: string } | null {
  const i = productId.indexOf(":");
  if (i < 1) return null;
  return { brand: productId.slice(0, i), batteryCode: productId.slice(i + 1) };
}

export function productIdToPathSegment(productId: string): string {
  return productId.replace(":", "__");
}

export function pathSegmentToProductId(segment: string): string {
  return segment.replace("__", ":");
}
