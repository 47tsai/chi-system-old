# logo/ — Chi 標誌

- 正本只有一份：`logo.svg`（chi 主站，藍底白字，菱形 `#4A88FC`、C 為 Geekomet Demo 字體轉外框）。
- 各站 PNG 是從正本輸出的（512×512），檔名用**站點 ID**：`chi`、`fg`、`merch`、`nav`、`h`、`status`，後綴 `-w`＝白色 C、`-b`＝黑色 C；另有單色版 `black-w`、`white-b`。
- 菱形色＝各站識別色（以 `sites.json` 為準）：chi `#4A88FC`、fg `#FF9A00`、merch `#584CCC`、nav `#008CAD`、h `#FF61F6`、status `#8CDC47`。
- C 顏色規則（齊 2026-11-09 定案）：深色模式用白 C（`-w`）、淺色模式用黑 C（`-b`）；favicon 與其他用途一律用白 C（`-w`）。
- 扁平化、無陰影；C 的右上臂超出菱形邊緣、左下兩個小圓點是標誌的一部分（Geekomet C 字形自帶），皆保留。
- 字體檔不進 repo：C 已轉成 SVG path，不需要字體檔也能正確顯示。Geekomet Demo 為個人使用授權、不可商用，商用須另購正式授權。
- 再生方式：改 `logo.svg` 的菱形／C 填色後，用 cairosvg 以 512×512 重新輸出對應 PNG。
