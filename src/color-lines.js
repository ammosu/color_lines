class ColorLines {
    constructor() {
        this.BOARD_SIZE = 9;
        this.LINE_LENGTH = 5;
        this.COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
        this.board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(0));
        this.selectedCell = null;
        this.score = 0;
        this.nextBalls = [];
        this.isAnimating = false;
    }

    resetGame() {
        this.board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(0));
        this.score = 0;
        this.selectedCell = null;
        this.nextBalls = [];
        this.isAnimating = false;
        this.generateNextBalls();
        this.addRandomBalls(5);
    }

    init() {
        this.resetGame();
        this.render();
    }

    generateNextBalls() {
        this.nextBalls = Array(3).fill().map(() => Math.floor(Math.random() * this.COLORS.length) + 1);
    }

    addRandomBalls(count) {
        if (this.nextBalls.length === 0) {
            this.generateNextBalls();
        }

        let added = 0;
        let attempts = 0;
        const maxAttempts = 100;

        while (added < count && attempts < maxAttempts) {
            let x = Math.floor(Math.random() * this.BOARD_SIZE);
            let y = Math.floor(Math.random() * this.BOARD_SIZE);

            if (this.board[y][x] === 0 && this.nextBalls.length > 0) {
                let colorIndex = this.nextBalls.shift();
                if (colorIndex >= 1 && colorIndex <= this.COLORS.length) {
                    this.board[y][x] = colorIndex;
                    added++;
                } else {
                    console.error(`無效的顏色索引：${colorIndex}`);
                }
            }

            attempts++;
        }

        while (this.nextBalls.length < 3) {
            this.nextBalls.push(Math.floor(Math.random() * this.COLORS.length) + 1);
        }

        if (this.isGameOver()) {
            this.gameOver();
        } else {
            this.checkLines(); // 在添加新球後檢查是否有形成連線
        }
    }

    gameOver() {
        alert("遊戲結束！你的得分是: " + this.score);
        // 这里可以添加其他游戏结束的逻辑
    }


    move(fromX, fromY, toX, toY) {
        if (this.isAnimating) {
            return false;
        }
        if (this.board[fromY][fromX] === 0) {
            this.showUserMessage("起始位置沒有球");
            return false;
        }
        if (this.board[toY][toX] !== 0) {
            this.showUserMessage("終點位置已有球");
            return false;
        }
    
        const path = this.findPath(fromX, fromY, toX, toY);
        if (!path) {
            this.showUserMessage("沒有找到有效路徑");
            return false;
        }
    
        this.isAnimating = true;
        const ballColorIndex = this.board[fromY][fromX] - 1;
        const ballColor = this.COLORS[ballColorIndex];
        
        // 獲取原始位置的球元素和棋盤
        const fromCell = document.querySelector(`[data-x="${fromX}"][data-y="${fromY}"]`);
        const originalBall = fromCell.querySelector('.ball');
        const gameBoard = document.getElementById('game-board');
        
        // 隱藏原始的球
        if (originalBall) {
            originalBall.style.display = 'none';
        }
    
        const ball = document.createElement('div');
        ball.className = 'ball animated-ball';
        ball.style.backgroundColor = ballColor;
        fromCell.appendChild(ball);
    
        let stepIndex = 0;
        const duration = 200;
        let startTime = null;
        
        // 獲取實際的尺寸和間距
        const cellWidth = fromCell.offsetWidth;
        const cellHeight = fromCell.offsetHeight;
        const gridGap = parseInt(window.getComputedStyle(gameBoard).gridGap) || 5; // 預設間距為 5px
        const boardPadding = parseInt(window.getComputedStyle(gameBoard).padding) || 5; // 預設 padding 為 5px
    
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
    
            if (stepIndex < path.length - 1) {
                const [currentY, currentX] = path[stepIndex];
                const [nextY, nextX] = path[stepIndex + 1];
    
                // 計算相對於起始位置的位移，包含間距和邊框
                const startX = (currentX - path[0][1]) * (cellWidth + gridGap);
                const startY = (currentY - path[0][0]) * (cellHeight + gridGap);
                const endX = (nextX - path[0][1]) * (cellWidth + gridGap);
                const endY = (nextY - path[0][0]) * (cellHeight + gridGap);
    
                // 計算當前位置
                const newX = startX + (endX - startX) * progress;
                const newY = startY + (endY - startY) * progress;
    
                ball.style.transform = `translate(${newX}px, ${newY}px)`;
    
                if (progress === 1) {
                    stepIndex++;
                    startTime = null;
                    
                    if (stepIndex < path.length - 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // 動畫結束，清理和更新狀態
                        if (originalBall) {
                            originalBall.remove();
                        }
                        this.board[toY][toX] = this.board[fromY][fromX];
                        this.board[fromY][fromX] = 0;
                        ball.remove();
                        this.isAnimating = false;
    
                        if (!this.checkLines()) {
                            this.addRandomBalls(3);
                            this.checkLines();
                        }
    
                        this.render();
                        this.checkBoardState();
                    }
                } else {
                    requestAnimationFrame(animate);
                }
            }
        };
    
        requestAnimationFrame(animate);
        return true;
    }

    findPath(startX, startY, endX, endY) {
        const queue = [[startY, startX]];
        const visited = new Set();
        const parent = new Map();
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        while (queue.length > 0) {
            const [y, x] = queue.shift();
            const key = `${y},${x}`;

            if (y === endY && x === endX) {
                // 找到路徑，重建並返回
                const path = [];
                let current = key;
                while (current) {
                    const [cy, cx] = current.split(',').map(Number);
                    path.unshift([cy, cx]);
                    current = parent.get(current);
                }
                return path;
            }

            if (visited.has(key)) continue;
            visited.add(key);

            for (const [dy, dx] of directions) {
                const newY = y + dy;
                const newX = x + dx;
                const newKey = `${newY},${newX}`;

                if (
                    newY >= 0 && newY < this.BOARD_SIZE &&
                    newX >= 0 && newX < this.BOARD_SIZE &&
                    (this.board[newY][newX] === 0 || (newY === endY && newX === endX)) &&
                    !visited.has(newKey)
                ) {
                    queue.push([newY, newX]);
                    parent.set(newKey, key);
                }
            }
        }

        return null; // 沒有找到路徑
    }

    checkLines() {
        const directions = [
            [[0, 1], [0, -1]], // 垂直
            [[1, 0], [-1, 0]], // 水平
            [[1, 1], [-1, -1]], // 對角線 \
            [[1, -1], [-1, 1]]  // 對角線 /
        ];

        let linesFound = false;

        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === 0) continue;

                for (const [dir1, dir2] of directions) {
                    let count = 1;
                    let lineCoords = [[y, x]];

                    for (const [dy, dx] of [dir1, dir2]) {
                        let ny = y + dy, nx = x + dx;
                        while (ny >= 0 && ny < this.BOARD_SIZE && nx >= 0 && nx < this.BOARD_SIZE && this.board[ny][nx] === this.board[y][x]) {
                            count++;
                            lineCoords.push([ny, nx]);
                            ny += dy;
                            nx += dx;
                        }
                    }

                    if (count >= this.LINE_LENGTH) {
                        linesFound = true;
                        this.score += count;
                        for (const [ly, lx] of lineCoords) {
                            this.board[ly][lx] = 0;
                        }
                    }
                }
            }
        }

        return linesFound;
    }

    render() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-label', `Cell at row ${y + 1}, column ${x + 1}`);


                if (this.board[y][x] !== 0) {
                    const colorIndex = this.board[y][x] - 1;
                    if (colorIndex >= 0 && colorIndex < this.COLORS.length) {
                        const ball = document.createElement('div');
                        ball.className = 'ball';
                        ball.style.backgroundColor = this.COLORS[colorIndex];
                        cell.appendChild(ball);
                    } else {
                        console.error(`無效的顏色索引：${colorIndex + 1}`);
                    }
                }

                cell.addEventListener('click', () => this.handleCellClick(x, y));
                boardElement.appendChild(cell);
            }
        }

        // 渲染分數
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = `得分: ${this.score}`;

        // 渲染下一輪的球
        const previewElement = document.getElementById('next-balls');
        previewElement.innerHTML = '';
        this.nextBalls.forEach(colorIndex => {
            if (colorIndex >= 1 && colorIndex <= this.COLORS.length) {
                const ball = document.createElement('div');
                ball.className = 'ball preview-ball';
                ball.style.backgroundColor = this.COLORS[colorIndex - 1];
                previewElement.appendChild(ball);
            } else {
                console.error(`無效的顏色索引：${colorIndex}`);
            }
        });

        // 更新或創建重新開始按鈕
        let restartButton = document.getElementById('restart-button');
        if (!restartButton) {
            restartButton = document.createElement('button');
            restartButton.id = 'restart-button';
            restartButton.textContent = '重新開始遊戲';
            document.getElementById('game-info').appendChild(restartButton);
        }
        restartButton.addEventListener('click', this.restartGame.bind(this));

        // 檢查遊戲是否結束
        if (this.isGameOver()) {
            this.showGameOverMessage();
        }
    }

    checkBoardState() {
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === undefined) {
                    console.error(`棋盤位置 (${y}, ${x}) 出現未定義的狀態`);
                }
            }
        }
    }

    isGameOver() {
        // 檢查棋盤是否已滿
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    showGameOverMessage() {
        const gameOverElement = document.getElementById('game-over-message');
        if (!gameOverElement) {
            const message = document.createElement('div');
            message.id = 'game-over-message';
            message.textContent = `遊戲結束！你的最終得分是: ${this.score}`;
            document.getElementById('game-info').appendChild(message);
        } else {
            gameOverElement.textContent = `遊戲結束！你的最終得分是: ${this.score}`;
        }
    }

    restartGame() {
        this.resetGame();
        this.render();

        const gameOverElement = document.getElementById('game-over-message');
        if (gameOverElement) {
            gameOverElement.remove();
        }
    }

    selectCell(x, y) {
        this.selectedCell = { x, y };
        document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add('selected');
    }

    deselectCell(x, y) {
        document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.remove('selected');
        this.selectedCell = null;
    }

    handleCellClick(x, y) {
        if (this.selectedCell) {
            if (this.selectedCell.x === x && this.selectedCell.y === y) {
                // 如果點擊的是已選中的球，取消選擇
                this.deselectCell(x, y);
            } else if (this.move(this.selectedCell.x, this.selectedCell.y, x, y)) {
                // 如果是有效移動，執行移動
                this.deselectCell(this.selectedCell.x, this.selectedCell.y);
            } else {
                // 如果是無效移動，選中新的球（如果點擊的是球）
                if (this.board[y][x] !== 0) {
                    this.deselectCell(this.selectedCell.x, this.selectedCell.y);
                    this.selectCell(x, y);
                }
            }
        } else if (this.board[y][x] !== 0) {
            // 如果沒有選中的球，而且點擊的是球，則選中該球
            this.selectCell(x, y);
        }
    }

    showUserMessage(message) {
        const messageElement = document.getElementById('user-message');
        if (!messageElement) {
            const newMessage = document.createElement('div');
            newMessage.id = 'user-message';
            newMessage.textContent = message;
            document.getElementById('game-info').appendChild(newMessage);
        } else {
            messageElement.textContent = message;
        }
        setTimeout(() => {
            const messageElement = document.getElementById('user-message');
            if (messageElement) {
                messageElement.remove();
            }
        }, 3000);
    }
}

// 使用示例
const game = new ColorLines();
game.init();
