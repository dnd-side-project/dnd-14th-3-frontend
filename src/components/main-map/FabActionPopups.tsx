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
  const locationShareModalType = useMainMapFabFlowStore((state) => state.locationShareModalType);
  const isFindCompanionModalOpen = useMainMapFabFlowStore(
    (state) => state.isFindCompanionModalOpen
  );
  const isDeniedState = locationShareModalType === "denied";

  return (
    <>
      <Popup
        isOpen={isLocationShareSetupModalOpen}
        title={isDeniedState ? "위치 권한이 차단되어 있어요" : "위치 정보 공유 설정"}
        content={
          isDeniedState
            ? "브라우저 설정에서 위치 권한을 허용하거나\n수동으로 위치를 설정해 주세요."
            : "근처에서 사진 동행을 찾기 위해\n위치 정보가 필요해요.\n실시간 추적은 하지 않고\n매칭 용도로만 사용해요."
        }
        confirmMessage={isDeniedState ? "수동으로 위치 설정" : "위치 공유 허용하기"}
        cancelMessage="잠시 멈출래요"
        onClose={onCloseAll}
        onConfirm={isDeniedState ? onPauseFromLocationShare : onConfirmLocationShare}
        onCancel={isDeniedState ? onCloseAll : onPauseFromLocationShare}
      />

      <Popup
        isOpen={isFindCompanionModalOpen}
        title="나의 동행 찾기"
        content={"현재 위치 기준 500m 이내에서\n사진 동행을 찾아요."}
        confirmMessage="동행을 찾을게요"
        cancelMessage="잠시 멈출래요"
        onClose={onCloseAll}
        onConfirm={onConfirmFindCompanion}
        onCancel={onPauseFromFindCompanion}
      />
    </>
  );
}
