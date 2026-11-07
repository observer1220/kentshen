---
title: 深色模式不閃白：一段放在 head 的小腳本
date: 2026-11-06
tags: 前端, CSS, 開發筆記
summary: 頁面載入先閃一下白色再變黑，是因為主題在 React 載入之後才套用。把判斷提前到 head 裡就能解決。
---

做深色模式最常見的瑕疵是：使用者選了深色，重新整理時畫面先白一下，才變黑。原因是主題的判斷寫在 React 元件裡，要等 JavaScript 載入、執行之後才會執行。

## 做法：在 head 裡先決定

在 `index.html` 的 `<head>` 放一小段同步腳本，在頁面第一次繪製之前就把主題寫到 `<html>` 上：

```html
<script>
  try {
    var t = localStorage.getItem("theme");
    if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = t;
  } catch (e) {}
</script>
```

CSS 用變數處理，深色模式只是換一組值：

```css
:root { --bg: #fff; --ink: #15171a; }
:root[data-theme="dark"] { --bg: #0f1114; --ink: #e8eaed; }
body { background: var(--bg); color: var(--ink); }
```

## 幾個細節

- **try/catch 不能省。** 無痕模式或封鎖儲存空間時，讀取 `localStorage` 會丟錯，沒有包起來整段腳本就中斷了。
- **預設跟隨系統。** 使用者沒按過切換鈕時，用 `prefers-color-scheme`；按過之後以使用者的選擇為準。
- **加上 `color-scheme`。** 在 CSS 裡設 `color-scheme: dark`，瀏覽器內建的捲軸、表單元件也會跟著變深。
- **預先渲染的頁面不用特別處理。** 因為主題是在客戶端 head 腳本決定的，靜態 HTML 本身是中性的。

整個機制不到十行，卻能讓切換鈕看起來像是原生功能。
