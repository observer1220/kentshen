---
title: 一支 deploy.sh 管所有專案：測試、預覽與正式環境
date: 2026-10-15
tags: 部署, Cloudflare, 開發筆記
summary: 一個人維護十幾個專案，我把部署收斂成同一個指令，並記下 dev 與 main 共用資料庫、migration 為什麼不自動執行等取捨。
---

我的每個專案根目錄都有一支 `deploy.sh`，用法完全一樣：

```bash
./deploy.sh          # 推到目前所在的分支
./deploy.sh dev      # 切到 dev 分支再推
./deploy.sh main     # 切到 main 分支再推（會多一道確認）
```

這支腳本做的事其實很少：跑檢查、commit、push。真正的建置與上線交給 Cloudflare 的 GitHub 連動，推上去就自動部署。commit 訊息自動帶時間戳記，例如 `Update: 2026-10-17 08:07:41`，因為我一個人維護，commit 訊息的重點是「可以回溯到什麼時間點」，而不是寫文章。

## 分支決定部署到哪裡

| 推到哪個分支 | 部署到 |
| --- | --- |
| `main` | 正式環境 |
| 其他分支，例如 `dev` | 預覽網址 `dev-專案名.…workers.dev` |

預覽版要先到 Dashboard 的 Build 設定裡打開「non-production branch builds」，否則非 main 的分支推上去不會產生預覽網址。這是一次性的設定，但我忘記過不只一次。

## 預覽與正式環境共用資料庫

這是最重要的取捨，也是最容易被誤解的地方。預覽版與正式版是**同一個 Worker 的不同版本**，所以 D1 資料庫與 secrets 全部共用。

好處是 dev 不用另外設定任何東西，立刻能測。代價是你在 dev 上做的寫入、刪除，會直接影響正式資料。以 Elsewhere 為例，dev 的測試也會計入每日 AI 生成次數的上限，並把測試行程寫進快取。所以我在 dev 測試時，會盡量重複同一組查詢去吃快取。

如果真的需要完全隔離的測試資料，就得另外建第二個 D1，那是更大的改動。對一個人維護的小工具來說，我選擇接受這個風險，並且把它寫進 README，免得半年後自己忘記。

## 為什麼 migration 不會自動跑

Workers Builds 只會執行 `wrangler deploy`，不會套用資料庫的 migration。有些專案（例如 Veil）的 `deploy.sh` 會在推送前主動執行 migration；有些專案（例如 Elsewhere）則刻意不自動執行。

原因是 Elsewhere 的幾支 migration 不是冪等的：`ALTER TABLE ADD COLUMN` 重跑會報錯，`INSERT` 重跑會灌進重複資料。所以我讓它只在明確指定時才執行，而且執行前先印出檔案前 20 行讓我確認：

```bash
./deploy.sh --list-migrations
./deploy.sh --migrate 007
```

可以重複執行的 migration，我則會把它寫成「重跑也安全」的形式，例如 Veil 的 migration 不會覆蓋管理頁改過的規則。

## 推送前只做真正有用的檢查

因為 push 就會觸發上線，壞掉的東西推上去就是線上壞掉。但檢查太多，我就會想繞過它。所以我只留兩種：

- **會讓使用者看不出問題的錯誤**：例如 Elsewhere 的 3D 地球檔案不見，頁面不會壞，只會安靜地退回沒有地球的版面，肉眼很難發現，所以擋在推送前。
- **跑得快的測試**：失敗就中止，不 commit 也不 push。

語法錯誤則交給 Cloudflare 建置時的 esbuild 擋下。建置失敗就不會部署，線上維持舊版，不會出現半殘的網站。真的需要繞過時，有 `--skip-checks`。

## 一個小提醒

如果新專案第一次跑 `./deploy.sh` 出現 `vitest: command not found`，不是腳本壞了，而是你還沒執行 `npm install`。依賴裝好再部署就沒問題。這種低級錯誤我自己也踩過。
