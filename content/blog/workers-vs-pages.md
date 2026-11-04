---
title: Cloudflare Workers 與 Pages 差在哪？我踩過的三個坑
date: 2026-10-14
tags: Cloudflare, Workers, 開發筆記
summary: 兩者在 Dashboard 上長得很像，但底層是不同產品。指令用錯會出現找不到專案的錯誤，這篇整理怎麼分辨與怎麼搬家。
---

如果你在 Cloudflare 上部署過網站，大概看過「Workers & Pages」這個選單。它們放在同一個地方，介面也很像，我一開始以為只是同一個東西的兩種叫法。實際上不是，而且我在這上面踩了幾次一樣的坑。

## 怎麼分辨你的專案是哪一種

最快的判斷方式是看網址：

- 網址是 `xxx.pages.dev`：這是 **Cloudflare Pages**。
- 網址是 `xxx.workers.dev`：這是 **Workers with Static Assets**（Workers 搭配靜態資源）。

兩種都能服務一個前端網站，也都能附帶後端邏輯，但部署的指令不同：

```bash
# Workers with Static Assets
npx wrangler deploy

# Cloudflare Pages
npx wrangler pages deploy
```

## 坑一：指令用錯，找不到專案

我的幾個專案在 Cloudflare 上是 Workers 專案，但我習慣性敲出 `wrangler pages deploy`，結果得到「project does not exist」。這個錯誤訊息很誤導人，因為專案明明就在 Dashboard 裡。原因是 Pages 系統裡真的沒有這個專案，它從頭到尾註冊在 Workers 那一邊。

規則很簡單：Workers 的所有指令就是把 `pages` 那一段拿掉，`wrangler secret put`、`wrangler dev`、`wrangler tail` 都是。

## 坑二：一個 Worker 同時管前端與 API

Workers 的做法是在 `wrangler.jsonc` 裡設定 `assets.directory` 指向建置出來的靜態檔，再用 `main` 指向一支 Worker 腳本。請求進來時，Worker 先看自己有沒有要處理這個路徑，沒有就交給靜態資源。這比 Pages Functions 那種每個端點一個檔案的方式更直接，新增 API 只要多寫一個 `if (url.pathname === ...)`。

要注意的是，如果你的網站不是單頁應用，`not_found_handling` 不要設成 `single-page-application`。設了之後所有打錯的路徑都會被導回 `index.html`，回應的是 200 而不是 404，搜尋引擎也會把這些亂打的網址當成真的頁面。

## 坑三：搬家之後舊站還活著

我的 Elsewhere 和 Undercurrent 原本都是 Pages 專案，後來照官方的遷移指南搬到 Workers。搬完之後，舊的 `pages.dev` 站台並不會自動消失，它會停在最後一次部署的內容。如果上面有已經分享出去的連結（例如行程分享網址），先確認這些連結還要不要保留，再決定要不要關掉。

搬家時業務邏輯我一個字都沒改。Pages Functions 拿到的是 `context` 物件，Workers 拿到的是 `(request, env, ctx)`，我只寫了一層轉接，把後者包成前者的形狀。這樣舊的處理函式可以原封不動地跑。

## 該選哪一個

新專案我會直接選 Workers with Static Assets：前後端同一個專案，同一個指令部署，靜態資源命中時還不計入 Worker 的呼叫次數。已經在 Pages 上穩定運作的站，沒有必要為了搬而搬。

重點是搞清楚自己用的是哪一個。一個簡單的網址判斷，可以省掉一個下午的疑惑。
