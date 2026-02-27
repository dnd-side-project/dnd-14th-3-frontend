import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export interface CalendarProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar({ selectedDate, onChange }: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const base = selectedDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const clicked = new Date(year, month, day);

    if (selectedDate && isSameDay(clicked, selectedDate)) {
      onChange(null);
    } else {
      onChange(clicked);
    }
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="w-full select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <button type="button" onClick={prevMonth} className="p-1 text-gray-700">
          <ChevronLeft size={20} />
        </button>
        <span className="text-body-1 font-semibold text-gray-900">
          {year}년 {month + 1}월
        </span>
        <button type="button" onClick={nextMonth} className="p-1 text-gray-700">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="flex h-9 items-center justify-center">
            <span className="text-label-1 text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Date grid */}
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="relative grid grid-cols-7">
          {row.map((day, colIdx) => {
            if (day === null) {
              return <div key={colIdx} className="py-0.5" />;
            }

            const current = new Date(year, month, day);
            const isSelected = !!selectedDate && isSameDay(current, selectedDate);

            return (
              <div
                key={colIdx}
                className="relative z-10 flex items-center justify-center py-0.5"
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`flex h-10.5 w-10.5 items-center justify-center rounded-full text-body-2 font-medium transition-colors ${
                    isSelected
                      ? "bg-mint-500 font-bold text-black"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {String(day).padStart(2, "0")}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
