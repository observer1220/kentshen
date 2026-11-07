---
title: 「CORS 錯誤」到底在擋什麼：我的 Workers API 設定方式
date: 2026-11-07
tags: Cloudflare, API, 開發筆記
summary: CORS 是瀏覽器的保護，不是伺服器壞了。看懂預檢請求，就知道該回哪些標頭。
---

前端呼叫自己的 API 時，如果看到 Console 出現「blocked by CORS policy」，很容易以為是伺服器出錯。其實請求通常已經成功送到了，是**瀏覽器**因為回應裡沒有許可的標頭，拒絕把結果交給你的程式。

## 什麼時候會遇到

只有「跨來源」才會觸發：網址的協定、網域、埠號任何一項不同就算。例如前端在 `https://app.example.com`，API 在 `https://api.example.com`，就是跨來源。如果前端與 API 在同一個網域，就沒有這個問題，這也是我偏好把前端與 API 放在同一個 Worker 的原因之一。

## 預檢請求

當請求帶有自訂標頭，或用了 `PUT`、`DELETE`，瀏覽器會先送一個 `OPTIONS` 請求詢問「我可以這樣做嗎？」。伺服器要回應許可的標頭，瀏覽器才會送出真正的請求。

```js
const allowed = new Set(["https://app.example.com"]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  if (!allowed.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    // ...處理正常請求，回應時同樣帶上 corsHeaders
  },
};
```

## 我的原則

- **不要隨手寫 `*`。** 只放行你自己的網域。對有登入狀態的 API，`*` 還可能無法與 Cookie 一起使用。
- **別忘了錯誤回應。** 4xx、5xx 的回應也要帶 CORS 標頭，否則前端看到的是 CORS 錯誤，而不是真正的錯誤訊息，很難除錯。
- **CORS 不是驗證。** 它只管瀏覽器，用 curl 呼叫完全不受影響。需要保護的 API 還是得做身分驗證。
