---
title: 把連結貼到 Threads 或 LINE，為什麼預覽圖有時是空的？og:image 檢查清單
date: 2026-11-06
tags: SEO, 分享預覽, 開發筆記
summary: 分享預覽卡片的圖與文字來自頁面的 Open Graph 標籤。這篇整理我自己的檢查清單，以及預覽更新不出來時的處理方式。
---

把網址貼進 Threads、LINE 或 Slack，會跳出一張有圖、有標題的卡片。這張卡片不是平台自己想出來的，而是爬蟲去讀你頁面 `<head>` 裡的幾行標籤。標籤沒寫好，卡片就是空的，或抓到奇怪的東西。

## 最少需要哪幾行

```html
<meta property="og:title" content="名稱｜一句話副標題" />
<meta property="og:description" content="一到兩句說明" />
<meta property="og:image" content="https://你的網域/og-image.png" />
<meta property="og:url" content="https://你的網域/" />
<meta name="twitter:card" content="summary_large_image" />
```

`og:image` 一定要用**絕對網址**。寫成 `/og-image.png` 時，有些爬蟲會解析失敗，預覽就沒有圖。

## 我的檢查清單

- 圖片比例約 1.91:1，常見尺寸是 1200×630。
- 圖片網址能直接在無痕視窗打開，不需要登入。
- 標題不要太長，超過一行半就會被截斷。
- 這些標籤要出現在**原始 HTML** 裡。爬蟲通常不執行 JavaScript，如果你的網站是單頁應用，標籤是前端動態塞進去的，爬蟲看不到。

最後一點是我做預先渲染的原因之一：建置時就把每一頁的標籤寫進 HTML，爬蟲拿到的就是完整內容。

## 預覽更新不出來

改了圖片，但貼出去還是舊圖，是因為平台快取了第一次抓到的結果。常見做法：

1. 換一個檔名，或在圖片網址後面加 `?v=2`。
2. 到平台的除錯工具重新抓取（例如 Facebook 的分享偵錯工具）。
3. 等待快取過期。

我的作品列表也用同一個來源：首頁顯示的縮圖直接讀各網站的 og:image，所以只要網站更新預覽圖，首頁就跟著變。
