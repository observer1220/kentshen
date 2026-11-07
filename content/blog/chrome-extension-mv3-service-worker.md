---
title: Manifest V3 的 service worker 會被關掉：外掛狀態該放哪裡
date: 2026-11-06
tags: Chrome 外掛, 開發筆記
summary: MV3 的背景腳本不再常駐，閒置後就會被回收。把狀態存在記憶體裡的外掛，過一會兒就會突然失憶。
---

Chrome 外掛從 Manifest V2 換到 V3，最大的行為差異是背景頁變成 service worker：它不會一直活著，閒置一段時間就會被瀏覽器關掉，有事件進來再重新啟動。

## 典型的錯誤

```js
let count = 0; // 放在全域變數

chrome.runtime.onMessage.addListener((msg) => {
  count++;
});
```

開發時一切正常，因為你一直在操作，worker 沒機會被回收。實際使用時，過幾分鐘 worker 被關掉，`count` 就歸零，使用者看到的是「設定怎麼不見了」。

## 規則：記憶體只當快取

任何要保留的資料，都存到 `chrome.storage`：

```js
chrome.runtime.onMessage.addListener(async (msg) => {
  const { count = 0 } = await chrome.storage.local.get("count");
  await chrome.storage.local.set({ count: count + 1 });
});
```

## 其他要注意的

- **事件監聽器要寫在最上層。** service worker 重啟時，只有在腳本第一次執行時同步註冊的監聽器才收得到喚醒它的事件。放在 `await` 後面註冊的會漏掉。
- **不要用 `setInterval` 做定時工作。** worker 一被回收，計時器就沒了。需要定時用 `chrome.alarms`。
- **要跟頁面溝通，走訊息傳遞。** content script 傳訊給 worker，worker 回應，不要假設兩邊有共用變數。
- **權限越少越好。** 這點我另外寫過一篇，講的是 `host_permissions` 與 `activeTab` 的取捨。

把 service worker 當成「隨時會被重開機的函式」，設計起來就不會出錯。
