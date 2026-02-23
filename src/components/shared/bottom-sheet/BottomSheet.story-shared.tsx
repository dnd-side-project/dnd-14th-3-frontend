import { type ComponentProps } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import type { BottomSheetHeaderActions } from "./index";
import { BottomSheet } from "./index";

export const FIGMA_BASE = "https://www.figma.com/design/z8WjEo3rhBbmTzGszMvlJz/DND3%EC%A1%B0";

export type StoryArgs = Partial<
  Omit<ComponentProps<typeof BottomSheet>, "isOpen" | "onClose" | "renderContent">
>;

export type Story = StoryObj<Meta<typeof BottomSheet> & { args?: StoryArgs }>;

export default function TriggerWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[80vh] items-center justify-center p-4">{children}</div>;
}

/** 스토리 공통: 시트를 여는 트리거 버튼 스타일 */
export const TRIGGER_BUTTON_CLASS =
  "rounded-lg bg-mint-500 px-4 py-2 font-medium text-black transition-colors";

/** 스토리 공통: 시트 열기 버튼 (레이블만 넘기면 됨) */
export function StoryTriggerButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={TRIGGER_BUTTON_CLASS}>
      {children}
    </button>
  );
}

/** 헤더에 접기 / 펼치기 / 닫기 버튼 */
export function SheetHeaderWithActions({
  title,
  actions,
  icon,
}: {
  title: string;
  actions: BottomSheetHeaderActions;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon}
        <h2 id="bottom-sheet-title" className="truncate text-heading-2 text-gray-900">
          {title}
        </h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="rounded px-2 py-1 text-label-2 text-gray-600"
          onClick={actions.collapse}
        >
          접기
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-label-2 text-gray-600"
          onClick={actions.expand}
        >
          펼치기
        </button>
        <button
          type="button"
          aria-label="닫기"
          className="rounded p-1 text-gray-500"
          onClick={actions.close}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/** 제목만, 액션 버튼 없음 */
export function SheetHeaderTitleOnly({ title }: { title: string }) {
  return (
    <div className="border-b border-gray-100 px-4 pb-3">
      <h2 id="bottom-sheet-title" className="text-heading-2 text-gray-900">
        {title}
      </h2>
    </div>
  );
}

/** 제목 + 닫기 버튼만 */
export function SheetHeaderCloseOnly({
  title,
  actions,
}: {
  title: string;
  actions: BottomSheetHeaderActions;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-3">
      <h2 id="bottom-sheet-title" className="text-heading-2 text-gray-900">
        {title}
      </h2>
      <button
        type="button"
        aria-label="닫기"
        className="rounded p-1 text-gray-500"
        onClick={actions.close}
      >
        ✕
      </button>
    </div>
  );
}

/** 접기/펼치기만 있고 닫기 버튼 없음 */
export function SheetHeaderCollapseExpandOnly({
  title,
  actions,
}: {
  title: string;
  actions: BottomSheetHeaderActions;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-3">
      <h2 id="bottom-sheet-title" className="text-heading-2 text-gray-900">
        {title}
      </h2>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="rounded px-2 py-1 text-label-2 text-gray-600"
          onClick={actions.collapse}
        >
          접기
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-label-2 text-gray-600"
          onClick={actions.expand}
        >
          펼치기
        </button>
      </div>
    </div>
  );
}
