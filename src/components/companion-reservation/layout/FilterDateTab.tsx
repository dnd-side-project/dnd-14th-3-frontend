import { Calendar } from "@/components/shared/calendar";

interface FilterDateTabProps {
  date: Date | null;
  onChange: (date: Date | null) => void;
}

export default function FilterDateTab({ date, onChange }: FilterDateTabProps) {
  return (
    <div className="flex flex-col h-80 gap-3">
      <Calendar selectedDate={date} onChange={onChange} />
    </div>
  );
}
