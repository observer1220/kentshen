---
title: 用 D1 做小型應用：我習慣的資料表與查詢方式
date: 2026-11-07
tags: Cloudflare, D1, 資料庫
summary: D1 是 Cloudflare 的 SQLite 資料庫，適合小而專注的工具。這篇記錄我設計資料表時的幾個習慣。
---

我的幾個小工具需要存資料，但量不大，也不想維護一台資料庫伺服器。Cloudflare D1 剛好合適：它是 SQLite，跟 Worker 在同一個平台上，設定也很少。

## 資料表設計的習慣

- **主鍵用文字 ID。** 例如隨機產生的短字串，避免網址裡暴露自增的流水號，別人也沒辦法逐一猜出其他資料。
- **每張表都有建立時間。** `created_at` 用整數的時間戳記，之後要排序、清理舊資料都用得到。
- **欄位預設值寫在資料表裡。** 不要全靠應用程式補。

```sql
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_shares_created ON shares(created_at);
```

## 查詢一律用參數綁定

```js
const row = await env.DB
  .prepare("SELECT payload FROM shares WHERE id = ?")
  .bind(id)
  .first();
```

不要用字串拼接 SQL。這不只是風格問題，是防止 SQL 注入的基本功。

## 幾個注意事項

- **migration 要可以重跑。** `IF NOT EXISTS` 是最簡單的做法，我另外寫過一篇講冪等性的文章。
- **一次要寫多筆時用 batch。** 減少來回的次數。
- **資料量大了再優化。** SQLite 對小型應用綽綽有餘，先把結構做對，不用預先擔心效能。
- **想清楚資料會留多久。** 分享連結這種資料，我會訂定期限並定期清理，不要讓表無限長大。

D1 讓我可以把心力放在功能上，而不是營運資料庫上。
