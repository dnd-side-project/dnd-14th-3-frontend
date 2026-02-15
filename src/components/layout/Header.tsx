import { Bell, Menu } from "lucide-react";

type HeaderProps = {
  title?: string;
};

export default function Header({ title }: HeaderProps) {
  if (!title) return <header className="h-14 border-b border-gray-100 bg-white" />;

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-gray-100 bg-white px-4">
      <div className="flex h-full items-center justify-between">
        <h1 className="text-heading-3 font-semibold">{title}</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="알림"
            className="rounded-md p-2 text-gray-700 cursor-pointer"
          >
            <Bell className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <button
            type="button"
            aria-label="메뉴"
            className="rounded-md p-2 text-gray-700 cursor-pointer"
          >
            <Menu className="h-5 w-5" strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </header>
  );
}
