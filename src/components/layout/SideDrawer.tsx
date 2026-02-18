import { useEffect } from "react";
import { NavLink } from "react-router-dom";

import { X } from "lucide-react";

import { layoutNavItems } from "@/constants/layout/nav-items";

type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`absolute inset-0 z-[60] ${isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"}`}
    >
      <button
        type="button"
        aria-label="Close side drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Side menu"
        className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
          <div></div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-md p-2 text-gray-700"
          >
            <X className="h-5 w-5" strokeWidth={1.9} />
          </button>
        </div>
        <nav className="px-2 py-3">
          <ul className="space-y-1">
            {layoutNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-3 text-body-1 font-semibold ${
                      isActive ? "bg-mint-50 text-mint-700" : "text-gray-700"
                    }`
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
