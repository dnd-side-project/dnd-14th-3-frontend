import { Button } from "@/components/shared/button";
import Checkbox from "@/components/shared/checkbox/Checkbox";

// 임시페이지
export default function Home() {
  return (
    <div>
      <Button.Primary>버튼 테스트</Button.Primary>

      <div>
        <Checkbox.Check state="checked">체크박스 체크됨</Checkbox.Check>
      </div>
      <div>
        <Checkbox.Round state="unchecked">체크박스 체크안됨</Checkbox.Round>
      </div>
      <div>
        <Checkbox.Primary state="checked" disabled>
          체크박스 체크됨 (비활성화)
        </Checkbox.Primary>
      </div>
    </div>
  );
}
