# RELEASE.md — chi-system 版本發佈流程

本文件是 SYSTEM.md 第 13 節的執行手冊：chi-system 如何發版、各站如何驗證、如何回滾。規範本身（版本判定、相容聲明、Tag 規則）以 SYSTEM.md 第 13 節為準，本文件只寫操作步驟；兩者衝突時以 SYSTEM.md 為準。

## 版本規則（摘要）

- 語意化版本 `vMAJOR.MINOR.PATCH`，各站引用時釘住完整版本號；不得自動跟隨最新版。
- 判定順序：先看相容性、再看可察覺性。PATCH＝無感修正；MINOR＝向後相容的新增或調整（含相容但可察覺的視覺／行為調整）；MAJOR＝不相容變更（改名或刪除 token／class／圖示、改主題機制或 header 結構、改 `sites.json` 欄位、改斷點值）。一次發布同時包含多級變更時，只取最高一級。
- 改既有 token 數值本身不決定級別，以結果判定：不可察覺＝PATCH；可察覺但相容＝MINOR；伴隨改名、刪除或用法改變＝MAJOR。判定依據（前後對照或量測差異）須寫進變更紀錄。
- 歸零：MAJOR 遞增時 MINOR 與 PATCH 歸零；MINOR 遞增時 PATCH 歸零；PATCH 只遞增自己。
- 每個版本須在變更紀錄中寫明「相容聲明」：各站需要改程式才能升級的是哪些、零改動可直接升級的是哪些。未寫相容聲明的版本不得發佈。
- 棄用程序：要移除的 token／元件／圖示，先在一個 MINOR 版標記棄用並寫明替代品，至少保留到下一個 MAJOR 版才可真正刪除。
- 已發佈的 Tag 與其內容不得覆寫、不得刪除、不得改指到另一個 commit。六站逐站升級，並存期（不同站釘不同版本）是常態。

## 發布步驟

1. **決定版本號**：依上列規則判定級別，寫進變更紀錄（SYSTEM.md 當輪修訂表）與相容聲明。
2. **預覽頁驗收**：在 `preview.html` 依第 13 節維度覆蓋逐項檢視（token、元件全集、互動狀態、主題、寬度、版面與資料狀態、灰階檢查），並在頁尾驗收紀錄表填寫結果。預覽頁未達要求，該版本不得發佈。
3. **檢查全綠**：`node scripts/check-breakpoints.mjs` 與 `node scripts/check-integrity.mjs` 皆通過（CI 同樣會跑，見下方）。
4. **更新 hash 清單**：若本輪改了任何共用件，執行 `node scripts/check-integrity.mjs --write` 重新產生 `hashes.json`，與改動一併提交。檢查失敗時不得手動改副本湊出相同結果。
5. **建立 Tag**：對發布基準 commit 建立 `vMAJOR.MINOR.PATCH` Tag。Tag 一經建立即不可改寫。
6. **部署**：GitHub Pages 隨 main 分支自動部署；確認 `preview.html` 與 `example.html` 在線上正常顯示。
7. **發布紀錄**：記一筆版本、Tag、基準 commit SHA、hashes.json 內容摘要、驗收紀錄表（或其連結）、相容聲明。

## 各站如何驗證所釘的版本

- 各站 CI 檢查本站共用件的版本標記或 hash 與所釘版本一致，不一致即失敗。
- 驗證方式：以該版本 Tag 的 `hashes.json` 為準，比對本站副本的 SHA-256（`sha256:<hex>`）。hash 對不上時，先視為同步或建置問題處理，不得直接改副本湊出相同結果。
- 回滾：把該站釘住的版本號改回升級前的版本，重新同步共用件並確認版本標記／hash 與舊版一致，重新部署，以 SYSTEM.md 第 18 節清單快速驗收受影響頁面，在原升級變更紀錄中記錄回滾原因、時間與後續處理。回滾只處理共用件版本，不回滾 chi-system 本身的 Tag；主題偏好 key `chi-theme-mode` 的值域（三態）在各版本間必須維持可互讀。

## CI

`.github/workflows/check.yml`：push 到 main 與 pull request 時執行。

- `node scripts/check-breakpoints.mjs`：斷點檢查（第 4 節）。
- `node scripts/check-integrity.mjs`：共用件一致性與 hash 檢查（第 13 節）。

任一失敗即整個檢查失敗，該次變更不得合併或發布。

## 首次正式發布

目前 SYSTEM.md 與 DESIGN.md 仍為審查稿、待齊審閱、未生效，因此本輪不建立任何正式 Release Tag。首次正式發布的版本號由齊在批准規範時定案（建議 `v1.0.0`），再依上方步驟執行。六站各自的版本線（各站第一次發布從 `v1.0.0` 起算）是另一條線，與 chi-system 版本完全分開，不得混寫。

## 相關檔案

| 檔案 | 用途 |
| --- | --- |
| `preview.html` | 預覽頁與驗收紀錄表格式（發版門檻） |
| `scripts/check-breakpoints.mjs` | 斷點檢查 |
| `scripts/check-integrity.mjs` | 一致性與 hash 檢查（`--write` 產生 `hashes.json`） |
| `hashes.json` | 共用件 SHA-256 清單（供各站驗證） |
| `.github/workflows/check.yml` | CI |
