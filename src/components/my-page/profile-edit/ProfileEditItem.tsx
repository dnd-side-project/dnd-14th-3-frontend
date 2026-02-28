import { ChevronRight } from "lucide-react";

interface ProfileEditItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  content: string;
}

export function ProfileEditItem({ label, content, ...props }: ProfileEditItemProps) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-label-1 font-medium text-gray-500">{label}</p>
        <p className="text-body-1 text-gray-900">{content}</p>
      </div>
      <ChevronRight className="size-6 shrink-0 text-gray-900" />
    </div>
  );
}
