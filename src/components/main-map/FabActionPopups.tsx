import { useMainMapFabFlowStore } from "@/store/main-map/fab-flow.store";

import { Popup } from "@/components/shared/popup";

interface FabActionPopupsProps {
  onCloseAll: () => void;
  onConfirmLocationShare: () => void;
  onPauseFromLocationShare: () => void;
  onConfirmFindCompanion: () => void;
  onPauseFromFindCompanion: () => void;
}

export default function FabActionPopups({
  onCloseAll,
  onConfirmLocationShare,
  onPauseFromLocationShare,
  onConfirmFindCompanion,
  onPauseFromFindCompanion,
}: FabActionPopupsProps) {
  const isLocationShareSetupModalOpen = useMainMapFabFlowStore(
    (state) => state.isLocationShareSetupModalOpen
  );
  const isFindCompanionModalOpen = useMainMapFabFlowStore((state) => state.isFindCompanionModalOpen);

  return (
    <>
      <Popup
        isOpen={isLocationShareSetupModalOpen}
        title="위치 정보 공유 설정"
        content={
          "근처에서 사진 동행을 찾기 위해\n위치 정보가 필요해요.\n실시간 추적은 하지 않으며\n매칭 용도로만 사용합니다."
        }
        confirmMessage="위치 공유 허용하기"
        cancelMessage="잠시 멈출래요"
        onClose={onCloseAll}
        onConfirm={onConfirmLocationShare}
        onCancel={onPauseFromLocationShare}
      />

      <Popup
        isOpen={isFindCompanionModalOpen}
        title="나의 동행 찾기"
        content={"현재 위치 기준 500m 이내에서\n사진 동행을 찾아요"}
        confirmMessage="동행을 찾을게요"
        cancelMessage="잠시 멈출래요"
        onClose={onCloseAll}
        onConfirm={onConfirmFindCompanion}
        onCancel={onPauseFromFindCompanion}
      />
    </>
  );
}
