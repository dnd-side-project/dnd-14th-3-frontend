import { REGION_1DEPTH } from "@/constants/companion-reservation/region-1depth";

/** 주소 문자열에서 1Depth 지역(region1Depth) 추출 */
export function extractRegion1DepthFromAddress(address: string): string {
  const fullValues = Object.values(REGION_1DEPTH);
  for (const full of fullValues) {
    if (address.includes(full)) return full;
  }
  for (const [short, full] of Object.entries(REGION_1DEPTH)) {
    if (address.startsWith(short) || address.includes(` ${short} `)) return full;
  }
  return "";
}
