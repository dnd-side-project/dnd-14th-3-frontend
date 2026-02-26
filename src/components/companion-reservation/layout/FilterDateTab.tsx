import type { DateRange } from "@/types/companion-reservation";

import { Calendar } from "@/components/shared/calendar";

interface FilterDateTabProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

export default function FilterDateTab({ dateRange, onChange }: FilterDateTabProps) {
  return (
    <Calendar
      startDate={dateRange.start}
      endDate={dateRange.end}
      onChange={onChange}
    />
  );
}
