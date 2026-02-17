import type { IntroStepContent } from "@/types/on-board";

export const INTRO_STEPS: IntroStepContent[] = [
  {
    id: "photo-companion",
    imageSrc: "/on-board/Onboard_intro_1.png",
    title: "사진 동행을 지금 바로 만나요",
    description: "지금 내 주변에 있는 상대와\n바로 만나 짧은 사진 동행이 되어보세요",
  },
  {
    id: "schedule-companion",
    imageSrc: "/on-board/Onboard_intro_2.png",
    title: "내 일정에 맞게 동행을 구해요",
    description: "카페, 야구장, 콘서트, 여행 등 나의 일정에 맞게\n원하는 동행을 미리 찾아보세요",
  },
  {
    id: "safe-companion",
    imageSrc: "/on-board/Onboard_intro_3.png",
    title: "상대와 안심하고 만나요",
    description: "서로의 사진 스타일을 확인하고,\n본인 인증된 상대와 안전하게 동행해보세요.",
    ctaLabel: "시작하기",
  },
];
