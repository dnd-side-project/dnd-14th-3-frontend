import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CompanionScheduleCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  /** 해당 날짜에 일정이 있는지 (YYYY-MM-DD → boolean) */
  hasScheduleOn?: (date: string) => boolean;
}

export default function CompanionScheduleCalendar({
  selectedDate,
  onSelectDate,
  hasScheduleOn,
}: CompanionScheduleCalendarProps) {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const calendarDays = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();

    const prevMonth = new Date(viewYear, viewMonth, 0);
    const prevDays = prevMonth.getDate();
    const prev: { date: string; isCurrentMonth: false }[] = [];
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonthNum = viewMonth === 0 ? 12 : viewMonth;
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevDays - i;
      prev.push({
        date: `${prevYear}-${String(prevMonthNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    const current: { date: string; isCurrentMonth: true }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      current.push({
        date: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: true,
      });
    }

    const total = prev.length + current.length;
    const nextCount = total % 7 === 0 ? 0 : 7 - (total % 7);
    const next: { date: string; isCurrentMonth: false }[] = [];
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextMonthNum = viewMonth === 11 ? 1 : viewMonth + 2;
    for (let d = 1; d <= nextCount; d++) {
      next.push({
        date: `${nextYear}-${String(nextMonthNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    return [...prev, ...current, ...next];
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="rounded-xl bg-gray-50 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="flex size-8 items-center justify-center rounded-lg text-gray-600 active:bg-gray-200"
          aria-label="이전 달"
        >
          ←
        </button>
        <span className="text-body-1 font-semibold text-gray-900">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          className="flex size-8 items-center justify-center rounded-lg text-gray-600 active:bg-gray-200"
          aria-label="다음 달"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-label-2 text-gray-500"
          >
            {day}
          </div>
        ))}
        {calendarDays.map(({ date, isCurrentMonth }) => {
          const isSelected = selectedDate === date;
          const hasSchedule = hasScheduleOn?.(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex size-9 items-center justify-center rounded-lg text-label-2 transition-colors ${
                !isCurrentMonth ? "text-gray-300" : "text-gray-900"
              } ${isSelected ? "bg-mint-500 text-black" : "active:bg-gray-200"} ${
                hasSchedule && isCurrentMonth && !isSelected ? "font-semibold" : ""
              }`}
            >
              {date.split("-")[2]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
