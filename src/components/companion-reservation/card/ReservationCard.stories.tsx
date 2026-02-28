import type { Meta, StoryObj } from "@storybook/react-vite";

import ReservationCard, { ReservationCardFooter } from "./ReservationCard";

const meta = {
  title: "companion-reservation/ReservationCard",
  component: ReservationCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "동행/예약 카드 컴포넌트.",
          "",
          "**내 동행 탭** (`viewMode: me`) — 내가 올린 요청에 사용합니다.",
          "- `recruiting` : Primary CTA '지원자 보기' → 지원자 목록으로 이동",
          "- 그 외 상태  : Secondary CTA '상세 보기' → 상세 페이지로 이동",
          "",
          "**동행 탭** (`viewMode: search`) — 피드 탐색에 사용합니다.",
          "- 작성자 정보(`RequesterInfo`)를 하단에 표시합니다.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["recruiting", "confirmed", "pending", "closed"],
      description: "상태(배지·CTA 스타일 결정)",
    },
    labelText: { control: "text", description: "배지 라벨" },
    title: { control: "text", description: "카드 제목" },
    dateLabel: { control: "text" },
    timeLabel: { control: "text" },
    locationLabel: { control: "text" },
    tags: { control: "object" },
    applicantMessage: { control: false },
    footer: { control: false },
  },
  args: {
    status: "recruiting",
    labelText: "지원자 모집중",
    title: "홍대에서 사진 동행 구해요",
    dateLabel: "2026년 2월 5일",
    timeLabel: "14:00",
    locationLabel: "홍대입구역 9번 출구",
    tags: ["전신샷", "30분"],
  },
} satisfies Meta<typeof ReservationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── 내 동행 탭 ──────────────────────────────────────────────────

/** 모집중: 지원자 수 메시지 + Primary '지원자 보기' CTA */
export const MyPosted_Recruiting: Story = {
  name: "내가 올린 요청 / 모집중",
  args: {
    applicantMessage: {
      prefix: "현재 ",
      highlight: "3명",
      suffix: "이 지원했어요",
      highlightColorClass: "text-mint-500",
    },
    footer: <ReservationCardFooter.CTA label="지원자 보기" status="recruiting" variant="primary" />,
  },
};

/** 확정됨: Secondary '상세 보기' CTA */
export const MyPosted_Confirmed: Story = {
  name: "내가 올린 요청 / 확정됨",
  args: {
    status: "confirmed",
    labelText: "확정됨",
    footer: <ReservationCardFooter.CTA label="상세 보기" status="confirmed" variant="secondary" />,
  },
};

/** 대기중: disabled Secondary '상세 보기' CTA */
export const MyPosted_Pending: Story = {
  name: "내가 올린 요청 / 대기중",
  args: {
    status: "pending",
    labelText: "대기중",
    footer: (
      <ReservationCardFooter.CTA label="상세 보기" status="pending" variant="secondary" disabled />
    ),
  },
};

/** 종료된 일정: Secondary '상세 보기' CTA */
export const MyPosted_Closed: Story = {
  name: "내가 올린 요청 / 종료된 일정",
  args: {
    status: "closed",
    labelText: "종료된 일정",
    footer: <ReservationCardFooter.CTA label="상세 보기" status="closed" variant="secondary" />,
  },
};

// ─── 동행 탭 (피드) ──────────────────────────────────────────────

/** 동행 탭: 작성자 정보 표시 */
export const Browse_WithRequester: Story = {
  name: "동행 탭 / 작성자 정보",
  args: {
    applicantMessage: undefined,
    footer: (
      <ReservationCardFooter.RequesterInfo
        avatarUrl="https://i.pravatar.cc/40?img=3"
        description="개발자 · 20대 · 남성"
      />
    ),
  },
};

// ─── 엣지 케이스 ─────────────────────────────────────────────────

/** 태그·푸터 없는 최소 카드 */
export const Minimal: Story = {
  args: {
    tags: [],
    footer: undefined,
  },
};

/** 제목·위치 텍스트가 긴 경우 */
export const LongText: Story = {
  args: {
    title:
      "사진 찍는 걸 좋아하지만 혼자 서울 살다 보니 사진이 없어서 늘 아쉬워요. 서로 사진 찍어주면서 부담 없이 여행하고 싶어요.",
    locationLabel: "서울 구로구 고척로 21 고척스카이돔 1번 출입구 앞",
    applicantMessage: {
      prefix: "현재 ",
      highlight: "10명",
      suffix: "이 지원했어요",
      highlightColorClass: "text-mint-500",
    },
    footer: <ReservationCardFooter.CTA label="지원자 보기" status="recruiting" variant="primary" />,
  },
};
