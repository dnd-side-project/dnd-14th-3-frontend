import { useCallback, useState } from "react";

/**
 * 고유 키 생성 함수
 * crypto.randomUUID가 있으면 사용, 없으면 랜덤 문자열 생성
 * http 환경에서는 crypto.randomUUID가 없으므로 랜덤 문자열 생성
 */
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

/**
 * 바텀시트 열림 상태 + 마운트용 키를 함께 다룸.
 * open() 호출 시마다 새 키를 부여해, 열 때마다 컴포넌트가 깨끗하게 마운트되도록 함.
 *
 * @example
 * const sheet = useBottomSheet();
 * <BottomSheet key={sheet.key} isOpen={sheet.isOpen} onClose={sheet.close} ... />
 * <button onClick={sheet.open}>열기</button>
 */
export function useBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState(() => generateUUID());

  const open = useCallback(() => {
    setKey(generateUUID());
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, open, close, key };
}
