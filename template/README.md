# template/ — 新站模板

新站的唯一 起點（SYSTEM.md 第 15 節第 7 步）。取代舊 `example-site` 與舊 `example/`。

## 內容

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 新站起始頁：header＋副導覽列、主內容、頁尾，全部用 chi-system 共用件 |
| `states.html` | 四種資料狀態範例頁：載入、空、錯誤、成功（第 9 節） |
| `release.json` | 發布 manifest 範本（第 13 節）：本站版本、所釘 chi-system 版本 |
| `README.md` | 本文件 |

## 從模板開新站

1. **複製**：把整個 `template/` 複製為新站 repo 的起點。
2. **換成本站內容**：站名、站 ID、本站導覽連結、logo（站點 ID 命名，淺色黑 C `-b.png`、深色白 C `-w.png`，見 `logo/README.md`）。跨站導覽與頁尾站點清單一律由 `sites.json` 產生，不得手寫站點 URL 清單。修改 registry 後，在 chi-system repo 根目錄執行 `node scripts/generate-navigation.mjs`，再執行 `node scripts/generate-navigation.mjs --check` 驗證產物。
3. **共用件改釘版引用**：模板內的 `../theme.js`、`../tokens.css`、`../components.css`、`../navigation.css`、`../icons.svg`、`../logo/` 是相對路徑，只供在 chi-system 內預覽。正式站把 chi-system 的共用件複製進本站（或以本站建置流程取用），釘住完整版本號（Tag，格式 `vMAJOR.MINOR.PATCH`，第 13 節），升級時看過差異並驗收，不得自動跟隨最新版，也不得熱連結 chi-system 的 `main` 分支。
4. **填 `release.json`**：`site` 填本站 ID；`version` 從 `1.0.0` 起算（第 16 節）；`chiSystemVersion` 填所釘的 chi-system 版本（目前 chi-system 尚未建立正式 Release Tag，先填 `0.0.0` 佔位，等第一個 Tag 建立後改為該版本）。多元件站加 `components`（key 為元件 ID，value 為該元件來源 commit 的完整 SHA 與 `commitShort`）。`release.json` 不得有 `commit`、`commitShort`、`deployedAt` 欄位（第 13 節第 5 點）。
5. **接 CI 產生 `version.json`**：CI 在 Tag 觸發時依 `release.json` 與 Tag 產生對外的 `version.json`（建置產物，不進 repo），並把版本號與短 SHA 注入頁尾（與 `version.json` 同源，不得手寫死在 HTML 裡）。`/version.json` 回應帶 `Cache-Control: no-cache` 或等效短快取。
6. **資料狀態**：會載入資料的區塊都要有四種狀態，範例見 `states.html`。`states.html` 的切換按鈕與內嵌 script 只是演示，正式站改為本站的資料載入邏輯。
7. **預覽**：用本機伺服器或 GitHub Pages 開，不要直接以 `file://` 開——瀏覽器限制下 `icons.svg` 的 `<use>` 引用可能無法顯示。

## 驗收

新站完成後依 SYSTEM.md 第 18 節驗收：CI 全綠（含共用件版本／hash 檢查與斷點檢查）、淺色／深色／系統三態、桌面與手機寬度、鍵盤操作與 focus 樣式、對比實測、四種資料狀態、無舊主題 key 與寫死數值、頁尾版本與 `version.json` 一致。

## 注意

- 本模板不是正式站：站名、版本號、logo 都是佔位值，未填完不得發布。
- 舊 `example-site` 的處置見 SYSTEM.md 第 17 節：內容已併入本模板，且沒有任何站或文件連到它的頁面時才可刪除；刪除是不可逆操作，仍須經齊逐項確認，本文件不自動授權。
