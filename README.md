# chi-system

Chi 生態系共用設計系統的 canonical 來源：總規範與共用件都以這個 repo 為準。
六個納入統一的網站（chi、fg、merch、nav、h、status）共用同一套 token、主題、圖示、header 與元件；
不納入統一的站（sub、ipa、ipap、sms、auth、vault）不在本 repo 的範圍內。

## 狀態

- `SYSTEM.md` v1.12 與 `DESIGN.md` v2.9：皆為審查稿，**待齊審閱、未生效**。
- 本 repo 目前只有規範文件與工作規則；共用件（`sites.json`、`icons.svg`、`theme.js`、`tokens.css` 等）依 `SYSTEM.md` 第 15 節順序建立，尚未開始。

## 內容

| 檔案 | 內容 |
| --- | --- |
| `SYSTEM.md` | 總規範：範圍、命名、主題、斷點、版本、流程、驗收門檻，唯一準則 |
| `DESIGN.md` | 設計語言：Clean／Neutral／Functional／Comfortable，語意層級、理由與示例 |
| `AGENTS.md` | 在這個 repo 工作的方式：決策來源、推送流程、版本規則、禁區 |
| `README.md` | 本文件 |

## 建置順序（摘要，完整版見 `SYSTEM.md` 第 15 節）

1. 規範文件、`AGENTS.md`、`README.md`（本階段）
2. `sites.json`、`logo/`、`breakpoints.json`
3. `icons.svg` → `theme.js` → `tokens.css` → `components.css`／`navigation.css`／header 模板
4. `template/` → 預覽頁、版本發佈／hash 檢查／CI
5. 以上完成後，才開始逐站遷移：nav → status → fg → merch → h → chi

## 工作方式（摘要，完整版見 `AGENTS.md`）

- 直接提交 `main`，不建立 PR；每個 commit 一個主題，並寫明改動、風險、驗收方式與回滾方式。
- 推送前必須重新核對遠端 HEAD 與同步紀錄一致，否則先合併再推，不得覆寫他人已發布的改動。
- 不可逆操作（部署正式環境、刪除 repo 或資料、撤銷憑證、服務下線）逐項經齊確認。
- 斷點 px 值與全部視覺 token 數值尚未定稿，不得自行填入。

## 相關連結

- 個人站：https://chi.qzz.io
- GitHub：https://github.com/47tsai
- 舊設計系統（留用至遷移完成後封存）：https://github.com/47tsai/chi-design-system
