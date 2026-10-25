# 我們的家 · 回憶群島

一個以家為中心、可旋轉與縮放的 3D 回憶群島，收藏兩個人的旅行與日常。小人物會在島上的步道散步，哞哞與花花也會走動。

- **我們的家**：群島中心，也是故事的起點。
- **七座旅行島**：台灣、菲律賓、日本、香港、比利時、荷蘭、法國。
- **婚姻島**：收藏結婚與共同生活的紀念。
- **哞花島**：哞哞與花花的專屬領地。
- **泡泡星球**：期待 2027 年抵達的小島民。

目前沒有預填旅行日期、婚期或私人照片。每座島可自訂名稱、日期、故事及一張照片。島嶼、地標、小人物與貓咪都由程式建立立體模型，使用 WebGL 與儲存庫內的 Three.js 0.186.1 繪製，不依賴外部圖片、字型、模型、地圖服務或 API。原創 SVG 保留在回憶對話框與無法使用 WebGL 的瀏覽器備援畫面。

## 在本機開啟

不需要安裝套件，也不需要建置。在儲存庫目錄執行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

用瀏覽器開啟伺服器的根路徑即可。請透過 HTTP 開啟，避免不同瀏覽器對 `file:` 路徑儲存權限的差異。雲端工作環境已各自隔離，直接使用既有 checkout，不需另外建立 Git worktree。

## 使用方式

拖曳海面旋轉 3D 視角，使用滑鼠滾輪、右下角按鈕或手機雙指縮放。滑鼠右鍵拖曳可平移，手機雙指也可平移。點模型會把鏡頭移近該島；點島名或從「查看所有島嶼」目錄選擇目的地，就能開啟回憶。定位按鈕會重設鏡頭、停止自動環遊並還原篩選。

「島民散步中」可暫停或恢復人物、貓咪、風車與海面動畫，「環遊視角」可自動旋轉鏡頭。系統設定為減少動態時，島民預設休息；編輯回憶或頁面不在畫面內時也會暫停場景運算。「我們的旅行護照」列出七座旅行島。島名按鈕支援鍵盤 Tab、Enter 與空白鍵。

3D 需要支援 WebGL 2 的瀏覽器。無法建立 WebGL 畫布時會明確提示並顯示插畫地圖，回憶編輯與備份仍然可用。

在島嶼視窗中按「收藏這座島的回憶」，填寫名稱、日期、故事和照片後儲存。支援 JPG、PNG、WebP，單張來源檔上限 20 MB；照片會縮到最長邊 1600 像素並儲存為 JPEG。透明背景會鋪上暖白色，原始檔不會上傳。

## 資料保存與備份

回憶存於**目前裝置、目前瀏覽器、目前網站來源的 IndexedDB**。這不是帳號服務；夫妻雙方的裝置不會自動同步。沒有後端，也沒有將私人資料傳至網路。

- 清除瀏覽資料、變更網站網址或更換裝置，可能無法存取原有回憶。
- 使用頁尾「回憶備份」匯出 JSON，包含故事、日期、島名與照片。
- 在另一個裝置開啟網站並匯入備份即可搬移資料。同一座島以匯入內容取代，其他島保持原樣。
- 匯入會先驗證整份備份，再於單一交易中寫入；錯誤格式不會覆寫既有回憶。
- 備份檔包含私人照片與文字，請自行妥善保管。
- 空白日期及故事可以儲存；照片可以另行移除。

若日後需要雙人同步、每座島多篇遊記或多張相簿，可以再接上有登入與存取權限的資料庫及照片儲存服務。

## 檔案

- `index.html`：繁體中文介面與對話框。
- `style.css`：桌面與手機版面、配色、互動樣式。
- `app.js`：島嶼資料、原創插畫、地圖操作、IndexedDB、照片處理、備份。
- `scene3d.js`：立體島嶼、建築、人物步行、貓咪、光影、相機與模型點擊。
- `vendor/three/`：固定版本的 Three.js 及其 MIT 授權，不使用外部 CDN。
- `favicon.svg`：網站圖示。
- `logo_favicon.png`：保留原儲存庫素材；端對端測試使用它測試圖片上傳。

要調整島嶼座標與預設文案，編輯 `app.js` 中的 `ISLANDS`；3D 模型在 `scene3d.js` 的 `model()`、`person()` 與 `cat()` 中建立。網站不會因為某個島沒有回憶而捏造旅行故事。

## 驗證

JavaScript 語法檢查：

```bash
node --check app.js
node --check --input-type=module < scene3d.js
```

瀏覽器端對端測試需有 Python Playwright 與 Chromium。先啟動本機伺服器，再執行：

```bash
python3 tests/smoke.py
python3 tests/scene3d.py
```

如瀏覽器或伺服器位置不同，可使用 `CHROMIUM_PATH` 與 `TEST_BASE_URL` 指定。測試使用獨立瀏覽器 context 和暫存檔，不會覆寫使用者已存的回憶。

測試涵蓋真實 WebGL 幾何繪製、人物位置隨時間變化、休息模式、相機旋轉、模型點選靠近、自動環遊、減少動態偏好、無 WebGL 備援，以及原有的照片、故事與備份功能。測試以軟體 WebGL 執行，與桌面 Chromium 及模擬行動裝置互動；尚未在實體 iOS/Safari 或特定手機 GPU 測試。

## 上線

### Cloudflare Pages（目前選擇的部署平台）

建置指令為 `python3 scripts/build_site.py`，輸出目錄為 `dist/`，不需要安裝網站套件。`wrangler.jsonc` 定義 Pages 專案設定；尚未取得 Cloudflare 回傳的部署網址之前，不代表站點已建立。

若要由命令列部署，需在雲端環境設定中安全提供：

- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 帳戶的識別碼。
- `CLOUDFLARE_API_TOKEN`：限定該帳戶、具有 **Account → Cloudflare Pages → Edit** 權限的 API Token。不要把 Token 貼入聊天、命令列參數或儲存庫。
- 網路允許 `api.cloudflare.com` 及 `*.pages.dev`，供部署與部署後驗證使用。

然後執行：

```bash
python3 scripts/deploy_cloudflare.py
```

此工具會檢查專案是否存在、必要時建立 Pages 專案，再透過固定版本 Wrangler 4.152.0 上傳網站檔案（包含本機 3D 引擎與授權）至 `main` 正式分支。使用 npm 的正常 HTTPS 下載與完整性驗證，不會寫入密鑰檔案。既有同名專案若使用其他正式分支，工具會停止，以免誤部署。

也可由帳戶持有人在 Cloudflare 控制台選擇 **Workers & Pages → Create → Pages → Upload assets**，將 `dist/` 內容或網站 ZIP 上傳；這種方式不用把 API Token 提供給本開發環境。

### Netlify（替代部署）

本儲存庫已加入 `netlify.toml`，Netlify 匯入時會自動使用以下設定：

- 建置指令：`python3 scripts/build_site.py`
- 發布目錄：`dist`
- 不需要套件安裝、執行環境變數或應用程式密鑰。

建置只會把 HTML、CSS、JavaScript 與網站圖示複製到 `dist/`，不包含測試、原始照片或本機瀏覽器回憶。可先於本機執行相同建置指令；`dist/` 也能直接上傳至 Netlify Drop。

由 Netlify 網站登入帳號後，可用以下部署入口匯入公開儲存庫：

https://app.netlify.com/start/deploy?repository=https://github.com/annycfl/cfl-assets

此入口會建立站點及部署，可能要求 GitHub 授權或建立儲存庫副本；以頁面顯示為準。若想直接連結原有儲存庫，在 Netlify 選擇「Add new project → Import an existing project」，並選取 `annycfl/cfl-assets`。這些帳號授權必須由帳號持有人在 Netlify/GitHub 完成。取得 Netlify 的正式網址後，照片與回憶仍保存在各自瀏覽器。

### GitHub Pages（既有部署）

這是純靜態網站，沿用本儲存庫既有的 GitHub Pages 設定，由 `main` 分支的根目錄提供網站：

**https://annycfl.github.io/cfl-assets/**

更新檔案並推送到 `main` 後，GitHub 會自動執行 `pages-build-deployment`。可至儲存庫的 Actions 頁面確認部署結果。`.nojekyll` 讓 Pages 直接提供靜態檔案；所有程式與素材路徑皆為相對路徑，支援 `/cfl-assets/` 子目錄。

部署不會把本機瀏覽器的回憶一起傳上網。需要在正式網址重新匯入原本的 JSON 備份，之後的回憶仍只保存在使用者自己的瀏覽器。

參考概念來自使用者提供的 `https://puma.taipei/heart-island`。製作時環境無法存取該網址（HTTP 403），因此依照使用者描述設計原創插畫與互動，未複製其版面、程式或素材。
