export interface TagChipProps {
  label: string;
}

export default function TagChip({ label }: TagChipProps) {
  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-2.5 py-1 text-[12px] font-normal leading-[1.35] text-gray-600">
      {label}
    </span>
  );
}
