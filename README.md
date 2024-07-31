
# Color Lines

Color Lines 是一款簡單有趣的益智遊戲，玩家需要移動彩色球，使其在棋盤上形成連續的相同顏色的行或列，以此得分。遊戲目標是通過策略性地移動球來清空棋盤或達到最高分。

## 目錄
- [安裝](#安裝)
- [使用說明](#使用說明)
- [遊戲規則](#遊戲規則)
- [文件結構](#文件結構)
- [開發](#開發)
- [通過 Docker 部署](#通過-docker-部署)

## 安裝

### 本地環境

1. **Clone Project**：
   ```bash
   git clone https://github.com/你的用戶名/ColorLines.git
   cd ColorLines
   ```

2. **打開 index.html**：
   使用瀏覽器打開項目根目錄下的 `index.html` 文件，即可開始遊戲。

### 通過 Docker 部署

1. **構建並運行容器**：
   確保已安裝 Docker 和 Docker Compose，然後在項目根目錄運行：
   ```bash
   docker-compose up --build
   ```

2. **訪問應用**：
   應用將在瀏覽器中通過 `http://localhost:8080` 訪問。

## 使用說明

打開遊戲後，您會看到一個 9x9 的棋盤。初始時會隨機放置一些彩色球。點擊一個球，然後點擊一個空白格子來移動它。移動的目標是使球形成連續的五個或更多相同顏色的行、列或對角線。

## 遊戲規則

1. **移動球**：每次移動後，如果沒有形成連線，將會在棋盤上隨機生成三個新的彩色球。
2. **形成連線**：連線由至少五個相同顏色的球組成，連線消失後得分增加。
3. **遊戲結束**：當棋盤被填滿且無法移動時，遊戲結束。

## 文件結構

- `src/`：包含遊戲的源文件，包括 HTML、CSS 和 JavaScript。
  - `index.html`：主 HTML 文件。
  - `styles.css`：樣式表文件。
  - `color-lines.js`：遊戲邏輯和功能實現。

- `docker-compose.yml`：Docker Compose 配置文件，用於設定多容器應用。
- `Dockerfile`：定義了如何構建 Docker 映像。

## 開發

1. **環境設置**：
   - 確保本地安裝了最新版本的 Node.js 和 npm。

2. **開始開發**：
   - 可以直接在 `src` 目錄下修改 HTML、CSS 和 JavaScript 文件，實現新功能或改進現有功能。

## 通過 Docker 部署

該項目包含 Docker 和 Docker Compose 配置，可以輕鬆地構建和部署應用。使用 Docker 可以確保在任何支持 Docker 的環境中都能一致地運行應用。

1. **構建映像**：
   - Dockerfile 定義了應用的環境和依賴。
   - `src` 目錄將被複製到 Nginx 服務器的默認根目錄下。

2. **運行容器**：
   - Docker Compose 配置了服務和網絡，並將本地 `src` 目錄映射到容器內的 `/usr/share/nginx/html`。

---

此 README 提供了關於 Color Lines 遊戲的基本信息、安裝和運行指導、遊戲規則，以及開發和部署的詳細說明。希望對你有幫助！
