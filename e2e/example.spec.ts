import { expect, test } from "@playwright/test";

test("홈페이지 접속", async ({ page }) => {
  await page.goto("/");

  // React + Vite 기본 타이틀이 표시되는지 확인
  await expect(page).toHaveTitle(/Vite \+ React/);
});

test("기본 컴포넌트 렌더링", async ({ page }) => {
  await page.goto("/");

  // 페이지가 로드되었는지 확인
  await expect(page.locator("body")).toBeVisible();
});
