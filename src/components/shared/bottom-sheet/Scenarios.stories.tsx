import { useState } from "react";

import type { Meta } from "@storybook/react-vite";

import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import TriggerWrapper, {
  SheetHeaderCollapseExpandOnly,
  SheetHeaderTitleOnly,
  SheetHeaderWithActions,
  type Story,
  type StoryArgs,
  StoryTriggerButton,
} from "./BottomSheet.story-shared";
import { BottomSheet } from "./index";

/**
 * 앱에서 자주 쓰는 바텀시트 **시나리오** 모음.
 * - 1: 2단계 플로우 (유지/다음 → 80vh) · dim 닫힘
 * - 2: 헤더 없음 · dim 안 닫힘 · 푸터 취소로만 닫기
 * - 3: 접기만 가능 · 푸터로 다음 단계 → 80vh
 * - 4: 접기만 가능 · 푸터 확인으로 닫기
 * - 5: 접힌 시작 · 본문 입력 + 확인으로 닫기
 * - 6: 열었을 때 접힌 상태로 시작 (접기/펼치기/닫기 모두 가능)
 */
const meta = {
  title: "shared/BottomSheet/Scenarios",
  component: BottomSheet,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `실제 사용 시나리오:
1) 2단계 플로우 — 접힘 없음, dim 닫힘, 푸터 [유지 / 다음] → 다음 단계 80vh
2) 강제 선택 — 접힘 없음, dim 닫힘 없음, 헤더 없음, 푸터 [취소]로만 닫기
3) 단계 전환 — 접힘·dim 접힘·닫기 없음, 푸터 [다음] → 80vh 후 [확인]으로 닫기
4) 확인 후 닫기 — 접힘·dim 접힘·닫기 없음, 푸터 [확인]으로 닫기
5) 입력 폼 — 접힌 상태로 시작, 본문 입력 + [확인]으로 닫기
6) 접힌 상태로 시작 — 열릴 때 접힌 높이, 헤더에서 펼치기/접기/닫기`,
      },
    },
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

/** 1. 접힘 없음, dim 닫힘, 드래그 불가, 푸터 [유지 / 다음] → 다음 단계 80vh */
export const Scenario1_TwoStep_DimClose: Story = {
  render: (args) => {
    const sheet = useBottomSheet();
    const [step, setStep] = useState<1 | 2>(1);
    const openSheet = () => {
      setStep(1);
      sheet.open();
    };
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={openSheet}>
          시나리오 1 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          key={sheet.key}
          isOpen={sheet.isOpen}
          onClose={sheet.close}
          draggable={false}
          backdropClick="close"
          header={<SheetHeaderTitleOnly title="1단계" />}
          footer={(actions) =>
            step === 1 ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700"
                  onClick={() => {}}
                >
                  유지
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-mint-500 py-3 font-medium text-black"
                  onClick={() => setStep(2)}
                >
                  다음
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="w-full rounded-lg bg-mint-500 py-3 font-medium text-black"
                onClick={actions.close}
              >
                확인
              </button>
            )
          }
          renderContent={() =>
            step === 1 ? (
              <p className="text-body-1 text-gray-700">
                1단계. 오른쪽 버튼 누르면 다음 단계(80vh).
              </p>
            ) : (
              <div className="h-[80vh] text-body-1 text-gray-700">
                2단계. 80vh 높이.
              </div>
            )
          }
        />
      </TriggerWrapper>
    );
  },
  args: { draggable: false, backdropClick: "close" } satisfies StoryArgs,
};

/** 2. 접힘 없음, dim 닫힘 없음, 헤더 없음, 푸터 [취소]로만 닫기 */
export const Scenario2_FooterCancelOnly: Story = {
  render: (args) => {
    const sheet = useBottomSheet();
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={sheet.open}>
          시나리오 2 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          key={sheet.key}
          isOpen={sheet.isOpen}
          onClose={sheet.close}
          draggable={false}
          backdropClick="none"
          footer={(actions) => (
            <button
              type="button"
              className="w-full rounded-lg border border-gray-300 bg-gray-100 py-3 font-medium text-gray-700"
              onClick={actions.close}
            >
              취소
            </button>
          )}
          renderContent={() => (
            <p className="text-body-1 text-gray-700">
              헤더 없음. dim으로는 안 닫히고, 푸터 취소로만 닫기.
            </p>
          )}
        />
      </TriggerWrapper>
    );
  },
  args: { draggable: false, backdropClick: "none" } satisfies StoryArgs,
};

/** 3. 접힘·dim 접힘·닫기 없음, 푸터 [다음] → 80vh 후 [확인]으로 닫기 */
export const Scenario3_Collapse_TwoStep: Story = {
  render: (args) => {
    const sheet = useBottomSheet();
    const [step, setStep] = useState<1 | 2>(1);
    const openSheet = () => {
      setStep(1);
      sheet.open();
    };
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={openSheet}>
          시나리오 3 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          key={sheet.key}
          isOpen={sheet.isOpen}
          onClose={sheet.close}
          backdropClick="collapse"
          dragToClose={false}
          header={(actions) => (
            <SheetHeaderCollapseExpandOnly
              title={step === 1 ? "1단계" : "2단계"}
              actions={actions}
            />
          )}
          footer={(actions) =>
            step === 1 ? (
              <button
                type="button"
                className="w-full rounded-lg bg-mint-500 py-3 font-medium text-black"
                onClick={() => {
                  setStep(2);
                  actions.expand();
                }}
              >
                다음
              </button>
            ) : (
              <button
                type="button"
                className="w-full rounded-lg bg-mint-500 py-3 font-medium text-black"
                onClick={actions.close}
              >
                확인
              </button>
            )
          }
          renderContent={() =>
            step === 1 ? (
              <p className="text-body-1 text-gray-700">
                접기/펼치기만 가능. 닫기 없음. 푸터 버튼으로 다음 단계(80vh).
              </p>
            ) : (
              <div className="h-[80vh] text-body-1 text-gray-700">
                2단계. 80vh.
              </div>
            )
          }
        />
      </TriggerWrapper>
    );
  },
  args: { backdropClick: "collapse", dragToClose: false } satisfies StoryArgs,
};

/** 4. 접힘·dim 접힘·닫기 없음, 푸터 [확인]으로만 닫기 */
export const Scenario4_Collapse_FooterClose: Story = {
  render: (args) => {
    const sheet = useBottomSheet();
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={sheet.open}>
          시나리오 4 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          key={sheet.key}
          isOpen={sheet.isOpen}
          onClose={sheet.close}
          backdropClick="collapse"
          dragToClose={false}
          header={(actions) => (
            <SheetHeaderCollapseExpandOnly title="제목" actions={actions} />
          )}
          footer={(actions) => (
            <button
              type="button"
              className="w-full rounded-lg bg-mint-500 py-3 font-medium text-black"
              onClick={actions.close}
            >
              확인
            </button>
          )}
          renderContent={() => (
            <p className="text-body-1 text-gray-700">
              접기/펼치기 가능. dim·드래그로는 닫기 없음. 푸터 버튼으로만 닫기.
            </p>
          )}
        />
      </TriggerWrapper>
    );
  },
  args: { backdropClick: "collapse", dragToClose: false } satisfies StoryArgs,
};

/** 5. 접힌 상태로 시작, 본문 입력 + [확인]으로 닫기 */
export const Scenario5_Input_ConfirmClose: Story = {
  render: (args) => {
    const sheet = useBottomSheet();
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={sheet.open}>
          시나리오 5 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          key={sheet.key}
          isOpen={sheet.isOpen}
          onClose={sheet.close}
          initialSnap="collapsed"
          header={(actions) => (
            <SheetHeaderWithActions title="입력" actions={actions} />
          )}
          renderContent={(actions) => (
            <div className="space-y-4">
              <label className="block text-body-2 text-gray-700">
                <span className="mb-1 block">내용</span>
                <input
                  type="text"
                  placeholder="입력하세요"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-1 outline-none focus:border-mint-500"
                />
              </label>
              <button
                type="button"
                className="w-full rounded-lg bg-mint-500 py-3 font-medium text-black"
                onClick={actions.close}
              >
                확인
              </button>
            </div>
          )}
        />
      </TriggerWrapper>
    );
  },
  args: { initialSnap: "collapsed" } satisfies StoryArgs,
};

/** 6. 열었을 때 접힌 상태로 시작. 헤더에서 펼치기/접기/닫기 모두 가능 */
export const Scenario6_CollapsedInitial: Story = {
  render: (args) => {
    const sheet = useBottomSheet();
    return (
      <TriggerWrapper>
        <StoryTriggerButton onClick={sheet.open}>
          시나리오 6 열기
        </StoryTriggerButton>
        <BottomSheet
          {...args}
          key={sheet.key}
          isOpen={sheet.isOpen}
          onClose={sheet.close}
          initialSnap="collapsed"
          header={(actions) => (
            <SheetHeaderWithActions title="접힌 상태로 시작" actions={actions} />
          )}
          renderContent={() => (
            <p className="text-body-1 text-gray-700">
              열릴 때 접힌 높이로 시작합니다. 헤더 펼치기 버튼이나 드래그로
              펼쳐보세요.
            </p>
          )}
        />
      </TriggerWrapper>
    );
  },
  args: { initialSnap: "collapsed" } satisfies StoryArgs,
};
