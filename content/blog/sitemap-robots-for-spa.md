---
title: 單頁應用的 sitemap 與 robots.txt：我怎麼讓搜尋引擎找到每一篇文章
date: 2026-11-06
tags: SEO, 開發筆記
summary: 單頁應用只有一個 HTML，搜尋引擎很難發現內頁。建置時產生 sitemap，是最便宜的補救。
---

單頁應用（SPA）的先天問題是：所有路徑看起來都是同一個 `index.html`，搜尋引擎要執行 JavaScript 才看得到內容，而且不一定會去點每一個連結。我的做法是兩件事一起做：預先渲染每一頁，再產生一份 sitemap 明確告訴它有哪些網址。

## sitemap.xml 要有什麼

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kentshen.com/blog/some-post</loc>
    <lastmod>2026-11-05</lastmod>
  </url>
</urlset>
```

`loc` 一定要是完整網址。文章有日期，就把它填進 `lastmod`。

## 在建置時產生，而不是手寫

我的預先渲染腳本本來就會走過每一頁（首頁、文章列表、每篇文章、靜態頁），所以順手把這些網址收集起來寫成 `sitemap.xml`。新增一篇 Markdown，下次建置就自動出現在 sitemap 裡，不會忘記更新。

## robots.txt

```text
User-agent: *
Allow: /

Sitemap: https://kentshen.com/sitemap.xml
```

重點是最後那行：它告訴爬蟲 sitemap 在哪裡。

## 常見的坑

- **不存在的路徑回 200。** SPA 常設定成所有路徑都回 `index.html`，打錯網址也是 200，搜尋引擎會當成真的頁面。靜態檔與預先渲染的頁面存在時直接回應，其餘才交給前端處理，並讓前端顯示找不到頁面。
- **sitemap 裡放了不該收錄的頁面。** 草稿或測試頁不要放進去。
- **提交之後就不管。** 到 Google Search Console 提交一次，之後偶爾看一下「已建立索引」的數量是否跟網址數接近。
