import { useMemo, useState } from "react";

import { Search } from "lucide-react";

import { debounce } from "@/lib/shared/debounce";

export interface SearchBarProps {
  onChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchBar({
  onChange,
  defaultValue = "",
  placeholder = "지역/키워드로 검색",
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  // debounce 함수 인스턴스를 한 번만 생성 → 내부 timer가 호출 간에 유지됨
  const debouncedOnChange = useMemo(
	  () => debounce((value: string) => { onChange(value);  console.log(value)}, 400),
    [onChange]
  );

  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-gray-50 px-3 py-3.5">
      <Search className="size-5 text-gray-500" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          debouncedOnChange(e.target.value);
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
      />
    </div>
  );
}
