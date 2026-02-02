import { Button } from "@/components/shared/button";
import Checkbox from "@/components/shared/checkbox/Checkbox";

// 임시페이지
export default function Home() {
  return (
    <div>
      <Button.Primary>버튼 테스트</Button.Primary>

      <div>
        <Checkbox.Primary />
        <Checkbox.Round />
      </div>

      <div>
        <Checkbox.Primary size="small" state="checked" />
        <Checkbox.Round size="small" />
      </div>

      <div>
        <Checkbox.Primary size="small" state="partial" disabled />
        <Checkbox.Round size="small" disabled />
      </div>
    </div>
  );
}
