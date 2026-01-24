import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("렌더링 테스트", () => {
    render(<App />);
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();
  });

  it("버튼 클릭 시 카운트 증가", async () => {
    const user = userEvent.setup();
    render(<App />);
    const button = screen.getByRole("button", { name: /count is/i });

    expect(button).toHaveTextContent("count is 0");

    await user.click(button);
    expect(button).toHaveTextContent("count is 1");
  });
});
