import { Button } from "@/components/shared/button";
import Checkbox from "@/components/shared/checkbox/Checkbox";
import Radio from "@/components/shared/radio/Radio";
import Switch from "@/components/shared/switch/Switch";
import { useState } from "react";

// 임시페이지
export default function Home() {
  const [selected, setSelected] = useState("option1");
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
      <div className="flex flex-row items-center">
        <Radio.Group name="example" value={selected} onChange={setSelected}>
          <Radio.Option value="option1">옵션 1</Radio.Option>
          <Radio.Option value="option2">옵션 2</Radio.Option>
          <Radio.Option value="option3" state="checked" disabled>
            옵션 3 (비활성)
          </Radio.Option>
          <Radio.Option value="option4" state="unchecked" disabled>
            옵션 4 (비활성)
          </Radio.Option>
        </Radio.Group>
      </div>
      <div>
        <Switch />
        <Switch defaultChecked />
        <Switch disabled />
        <Switch disabled defaultChecked size="small" />
      </div>
      <div>
        <Switch label="알림 받기" />
      </div>
    </div>
  );
}
