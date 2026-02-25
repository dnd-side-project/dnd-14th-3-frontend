import type { ReactNode } from "react";

export interface MetaItemProps {
  icon: ReactNode;
  text: string;
}

export default function MetaItem({ icon, text }: MetaItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-[14px] font-medium leading-[1.4] text-gray-600">
      <span className="text-gray-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
