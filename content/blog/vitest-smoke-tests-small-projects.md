---
title: 小專案也該有測試：我只寫「冒煙測試」
date: 2026-11-06
tags: 測試, 開發筆記
summary: 不用追求覆蓋率。把最重要的幾個畫面渲染一遍、點幾個按鈕，就能擋住大部分改版時的低級錯誤。
---

個人專案沒有人幫我 code review，改版時最怕的是：改了 A 頁，B 頁壞了卻沒發現。我的解法不是追求高覆蓋率，而是寫少量的冒煙測試（smoke test）：確認重要的東西還在、還能用。

## 我測什麼

用 Vitest 加 Testing Library，在假的瀏覽器環境裡把整個 App 渲染出來：

```jsx
it("首頁顯示所有作品", () => {
  render(<App />);
  expect(document.querySelectorAll(".plates .plate").length).toBe(7);
});

it("搜尋框可以過濾作品", () => {
  render(<App />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "stock" } });
  expect(document.querySelectorAll(".plates .plate").length).toBe(1);
});
```

幾個我固定會檢查的項目：

- 首頁、文章列表、文章內頁、聯絡頁都能渲染。
- 導覽連結的網址正確。
- 搜尋與切換頁面的互動可用。
- 文章中的嵌入內容有出現。

## 這類測試的好處

- **寫起來快。** 不用模擬後端，也不用管細節樣式。
- **改版時有安全網。** 我把整站換過幾次視覺風格，每次測試失敗的地方，幾乎都是真的漏改或我故意改變的行為，這時就更新斷言。
- **跑得快。** 整組不到一秒，所以我每次部署前都會跑。

## 取捨

這種測試不會告訴你畫面好不好看，也抓不到 CSS 問題，那些還是要用瀏覽器看。但它能抓到「連結壞了」「頁面白屏」這類最難堪的錯誤，成本又很低。個人專案的測試，我覺得夠用就好。
