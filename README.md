# chi-system

Chi 生態系共用設計系統的 canonical 來源：總規範與共用件都以這個 repo 為準。
六個納入統一的網站（chi、fg、merch、nav、h、status）共用同一套 token、主題、圖示、header 與元件；
不納入統一的站（sub、ipa、ipap、sms、auth、vault）不在本 repo 的範圍內。

## 狀態

- `SYSTEM.md` v1.24 與 `DESIGN.md` v2.18：皆為審查稿，**待齊審閱、未生效**。
- 共用件已依 `SYSTEM.md` 第 15 節完成至第 8 步預覽頁、版本發佈／hash 檢查／CI：`sites.json`、`logo/`、`breakpoints.json`、`icons.svg`、`theme.js`、`tokens.css`、`components.css`、`navigation.css`、`header.html`、`sidebar.css`、`sidebar.js`、`sidebar.html`、`example.html`、`template/`、`preview.html`、`RELEASE.md`、`scripts/`、`hashes.json`、`.github/workflows/check.yml`。第 9 步逐站遷移尚未開始；尚未建立任何正式 Release Tag。

## 內容

| 檔案 | 內容 |
| --- | --- |
| `SYSTEM.md` | 總規範：範圍、命名、主題、斷點、版本、流程、驗收門檻，唯一準則 |
| `DESIGN.md` | 設計語言：Clean／Neutral／Functional／Comfortable，語意層級、理由與示例 |
| `AGENTS.md` | 在這個 repo 工作的方式：決策來源、推送流程、版本規則、禁區 |
| `README.md` | 本文件 |
| `sites.json` | 納入統一的六站 registry（站點 ID、站名、網址、描述、圖示、識別色） |
| `logo/` | 各站 logo（向量正本 `logo.svg`＋六站 × 白／黑 C 的 PNG） |
| `breakpoints.json` | 斷點唯一正式來源（768／1024） |
| `icons.svg` | Lucide 圖示 sprite（88 個 symbol） |
| `theme.js` | 三態主題切換（`chi-theme-mode`） |
| `tokens.css` | 視覺 token 唯一來源（淺深兩套） |
| `components.css` | 元件樣式（按鈕、表單、卡片、表格、徽章、對話框、資料狀態） |
| `navigation.css` | header、副導覽列、頁尾樣式 |
| `header.html` | header＋副導覽列模板 |
| `sidebar.css` | 側邊欄版式樣式（固定左側、收合圖示列、抽屜／底部列） |
| `sidebar.js` | 側邊欄邏輯（收合持久化、抽屜開關） |
| `sidebar.html` | 側邊欄版式模板 |
| `example.html` | 元件與 header 範例頁 |
| `template/` | 新站模板（起始頁、側邊欄版式起始頁、四種資料狀態範例頁、`release.json` 範本、使用說明） |
| `preview.html` | 預覽頁：發版驗收（token、元件、主題、寬度、資料狀態、灰階檢查、驗收紀錄表） |
| `RELEASE.md` | 版本發佈流程：版本判定、相容聲明、發佈步驟、各站驗證、回滾 |
| `scripts/` | 檢查腳本：斷點檢查、sites.json 導覽生成／一致性檢查、共用件一致性與 hash 檢查 |
| `hashes.json` | 共用件 SHA-256 清單（供各站驗證所釘版本） |
| `.github/workflows/check.yml` | CI：push 與 PR 時跑三支檢查腳本 |

## 建置順序（摘要，完整版見 `SYSTEM.md` 第 15 節）

1. 規範文件、`AGENTS.md`、`README.md`（已完成）
2. `sites.json`、`logo/`、`breakpoints.json`（已完成）
3. `icons.svg` → `theme.js` → `tokens.css` → `components.css`／`navigation.css`／`sidebar.css`／`sidebar.js`／header、側邊欄模板（已完成）
4. `template/`（已完成）→ 預覽頁、版本發佈／hash 檢查／CI（已完成）
5. 以上完成後，才開始逐站遷移：nav → status → fg → merch → h → chi

## 工作方式（摘要，完整版見 `AGENTS.md`）

- 直接提交 `main`，不建立 PR；每個 commit 一個主題，並寫明改動、風險、驗收方式與回滾方式。
- 推送前必須重新核對遠端 HEAD 與同步紀錄一致，否則先合併再推，不得覆寫他人已發布的改動。
- 不可逆操作（部署正式環境、刪除 repo 或資料、撤銷憑證、服務下線）逐項經齊確認。
- 斷點 px 值與全部視覺 token 數值已定案（斷點見 `breakpoints.json`，其餘見 `tokens.css`），不得自行改動已定案的數值。

## 相關連結

- 個人站：https://chi.qzz.io
- GitHub：https://github.com/47tsai
- 舊設計系統（留用至遷移完成後封存）：https://github.com/47tsai/chi-design-system
