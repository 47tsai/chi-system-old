# AGENTS.md — chi-system 工作規則

本 repo 是 Chi 生態系共用設計系統的 canonical 來源：總規範與共用件都以這裡為準。
在這裡動手之前，先讀本文件，再讀 `SYSTEM.md` 與 `DESIGN.md`。

## 決策來源

- `SYSTEM.md` 是唯一總規範：範圍、命名、站點、主題、斷點、版本、流程、驗收門檻都以它為準。
- `DESIGN.md` 只記錄設計方向、視覺數值與選擇理由；在 `SYSTEM.md` 已定原則之下補操作細節與示例屬於細化，只有另立無關新禁令或與 `SYSTEM.md` 衝突時才算逾越分工。
- 兩份文件衝突時，以 `SYSTEM.md` 為準；文件與實作不一致時，規範優先，依 `SYSTEM.md` 開頭的處理原則辦理（先記錄、暫停受影響部分、經齊確認才決定改哪一邊）。
- 一份事項只有一個決策來源：規則看 `SYSTEM.md`，視覺數值與理由看 `DESIGN.md`，行為流程看本文件。

## 狀態

- `SYSTEM.md`（v1.19）與 `DESIGN.md`（v2.13）目前都是審查稿，待齊審閱、未生效。不得自行宣布生效。
- 任何人（含 AI）不得在未經 `SYSTEM.md` 第 19 節程序時，直接修改規範去配合既有實作；這類修改視同未經確認的規範變更，審閱時應退回。

## 工作流程

- 直接提交 `main`，不建立 PR（齊已確認，適用規範文件修訂、一般維護與程式碼變更）；每個 commit 聚焦一個主題，commit 訊息與變更紀錄須說明改了什麼、風險、驗收方式與回滾方式。
- 不可逆操作（部署正式環境、刪除 repo 或資料、撤銷憑證、服務下線）不在本文件授權範圍內，逐項經齊確認後才執行。
- 改完必須跑該 repo 既有的測試與建置，CI 全綠才算完成；沒有測試的 repo，至少完成建置與實際開站檢查。
- **推送前必須重新核對遠端 HEAD**：與同步紀錄的 SHA 不一致就停下，先合併再推，不得直接覆寫。2026-11-08 曾因以過時快照推送，覆寫了 GPT 已發布的兩項改動（`cd1954c`、`ddcf0d3`），事後以 v1.12／v2.9 恢復並記錄。推送工具不強制核對，核對是推送者的責任。

## 版本與修訂紀錄

- `SYSTEM.md`、`DESIGN.md` 內容一改就升一版審查稿；每輪修訂在文件開頭附差異表（先讀本表，再讀正文），只記該輪的改動。
- 不得重寫別輪的修訂表：過去的表寫錯了，在新一輪的表裡寫明更正，不回改歷史。
- 兩份文件互相引用的版本號必須與檔案本身一致；交叉審查表共 18 列檢查項，狀態以表為準。
- 版本號是歷史事實：`SYSTEM.md` 無獨立的 v1.6 commit、`DESIGN.md` 無 v2.4，跳號留作紀錄，不回改。

## 不得自行決定的事

- 斷點 px 值與 token 數值已定案（斷點見 `breakpoints.json`，其餘見 `tokens.css`），不得自行改動已定案的數值；需要新數值時，先在 chi-system 新增語意名稱、發新版。
- 站點顏色提案（舊 `PROPOSAL.md` 的色值）未經齊確認，不得當成決策。
- `auth.chi.qzz.io` 的原始碼位置未知；補充前不描述其實作，只規範各站的接入行為。
- 介面、文案、文件與程式註解不使用 Emoji，狀態用圖示加文字表達（`SYSTEM.md` 第 11 節）。

## 建置順序（`SYSTEM.md` 第 15 節）

1. `SYSTEM.md`、`DESIGN.md`、本文件、`README.md`
2. `sites.json`（只收六個納入站）、`logo/`、`breakpoints.json`
3. `icons.svg`
4. `theme.js`
5. `tokens.css`
6. `components.css`、`navigation.css`、header 模板
7. `template/`
8. 預覽頁、版本發佈／hash 檢查／CI
9. 以上完成後，才開始第 16 節的逐站遷移（nav → status → fg → merch → h → chi）

## 檔案清單

| 檔案 | 內容 |
| --- | --- |
| `SYSTEM.md` | 總規範（唯一準則） |
| `DESIGN.md` | 設計語言：方向、原則、語意層級、理由與示例 |
| `AGENTS.md` | 本文件：AI 與協作者在 repo 內的工作規則 |
| `README.md` | repo 說明：用途、狀態、內容、建置順序 |
| `sites.json`、`logo/`、`breakpoints.json`、`icons.svg`、`theme.js`、`tokens.css`、`components.css`、`navigation.css`、`header.html`、`example.html`、`template/`、`preview.html`、`RELEASE.md`、`scripts/`、`hashes.json`、`.github/workflows/check.yml` | 依第 15 節順序建立（未完成前不存在） |
