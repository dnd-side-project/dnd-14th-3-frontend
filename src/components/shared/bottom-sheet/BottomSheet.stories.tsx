import { useState } from "react";

import type { Meta } from "@storybook/react-vite";

import TriggerWrapper, {
  SheetHeaderWithActions,
  type Story,
  type StoryArgs,
  StoryTriggerButton,
} from "./BottomSheet.story-shared";
import { BottomSheet } from "./index";

const meta = {
  title: "shared/BottomSheet",
  component: BottomSheet,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "## BottomSheet\n\n" +
          "하단에서 올라오는 시트 UI. **스냅 포인트**로 접힌/완전 펼침 높이를 제어합니다.\n\n" +
          "- **접힌 높이**: 헤더(핸들 + 헤더) 레이아웃\n" +
          "- **펼친 높이**: 본문(renderContent) 높이에 따라 측정\n" +
          '- **헤더**: header render prop으로 close / collapse / expand 액션 전달\n' +
          "- **dim 클릭**: backdropClick — none | collapse | close (기본 close)\n" +
          "- **드래그**: draggable, dragToClose 로 접기·닫기 동작 제어",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: { control: false },
    onClose: { action: "closed" },
    initialSnap: {
      control: "radio",
      options: ["collapsed", "full"],
      description: "열릴 때 접힌/펼침",
    },
    backdropClick: {
      control: "select",
      options: ["none", "collapse", "close"],
      description: "dim(배경) 클릭 시 동작",
    },
    draggable: {
      control: "boolean",
      description: "드래그로 접기/펼치기 허용",
    },
    dragToClose: {
      control: "boolean",
      description: "드래그로 아래 당겨 닫기 허용",
    },
    onSnapChange: { action: "snapChange" },
    renderContent: { control: false },
  },
  args: {
    initialSnap: "full",
    backdropClick: "close",
    draggable: true,
    dragToClose: true,
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

/**
 * 기본 동작: 접기/펼치기/닫기, dim 클릭, 드래그 모두 사용.
 * 실제 사용 시나리오는 **Scenarios** 스토리를 참고하세요.
 */
export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={() => setIsOpen(true)}>
          바텀시트 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          header={(actions) => (
            <SheetHeaderWithActions title="제목" actions={actions} />
          )}
          renderContent={() => (
            <p className="text-body-1 text-gray-700 h-[60vh]">
              접힌 높이 = 헤더, 펼친 높이 = 본문. 헤더에서 접기/펼치기/닫기, dim
              클릭, 드래그를 테스트해 보세요.
            </p>
          )}
        />
      </TriggerWrapper>
    );
  },
  args: { initialSnap: "full" } satisfies StoryArgs,
};
