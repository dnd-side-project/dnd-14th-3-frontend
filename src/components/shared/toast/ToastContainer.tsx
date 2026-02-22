interface ToastContainerProps {
  /** 아래에서부터의 거리 (px) */
  bottomOffset?: number;
}

export default function ToastContainer({ bottomOffset = 96 }: ToastContainerProps) {
  return (
    <div
      id="toast-container"
      className="fixed left-1/2 z-[70] flex flex-col-reverse gap-[4px] -translate-x-1/2"
      style={{ bottom: `${bottomOffset}px` }}
    />
  );
}
