import type { ViewSegment } from "@/types/companion-reservation";

import { VIEW_SEGMENTS } from "@/constants/companion-reservation";

export function getViewSegment(viewParam: string | null): ViewSegment {
  return VIEW_SEGMENTS.includes(viewParam as ViewSegment)
    ? (viewParam as ViewSegment)
    : "browse";
}
