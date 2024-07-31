class ColorLines {
  constructor() {
      this.board = Array(9).fill().map(() => Array(9).fill(0));
      this.colors = ['red', 'blue', 'green', 'yellow', 'purple'];
      this.selectedCell = null;
      this.score = 0;
      this.nextBalls = [];
  }

  init() {
      this.board = Array(9).fill().map(() => Array(9).fill(0));
      this.score = 0;
      this.selectedCell = null;
      this.nextBalls = [];
      this.generateNextBalls();
      this.addRandomBalls(5);
      this.render();
  }

  generateNextBalls() {
      this.nextBalls = Array(3).fill().map(() => Math.floor(Math.random() * this.colors.length) + 1);
  }

  addRandomBalls(count) {
      if (this.nextBalls.length === 0) {
          this.generateNextBalls();
      }

      let added = 0;
      let attempts = 0;
      const maxAttempts = 100;

      while (added < count && attempts < maxAttempts) {
          let x = Math.floor(Math.random() * 9);
          let y = Math.floor(Math.random() * 9);

          if (this.board[y][x] === 0 && this.nextBalls.length > 0) {
              let colorIndex = this.nextBalls.shift();
              if (colorIndex >= 1 && colorIndex <= this.colors.length) {
                  this.board[y][x] = colorIndex;
                  added++;
              } else {
                  console.error(`無效的顏色索引：${colorIndex}`);
              }
          }

          attempts++;
      }

      while (this.nextBalls.length < 3) {
          this.nextBalls.push(Math.floor(Math.random() * this.colors.length) + 1);
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
      console.log(`嘗試從 (${fromX}, ${fromY}) 移動到 (${toX}, ${toY})`);
      console.log("當前棋盤狀態:", this.board);

      if (this.board[fromY][fromX] === 0 || this.board[toY][toX] !== 0) {
          console.log("無法移動：起始位置沒有球或終點位置已有球");
          return false;
      }

      const path = this.findPath(fromX, fromY, toX, toY);
      if (!path) {
          console.log("沒有找到有效路徑");
          return false;
      }

      console.log("找到路徑:", path);

      this.board[toY][toX] = this.board[fromY][fromX];
      this.board[fromY][fromX] = 0;

      console.log("移動後的棋盤狀態:", this.board);

      if (!this.checkLines()) {
          console.log("添加新球之前");
          this.addRandomBalls(3);
          console.log("添加新球之後", this.board);
          this.checkLines(); // 檢查新添加的球是否形成連線
      }

      this.render();
      this.checkBoardState();
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
                  newY >= 0 && newY < 9 &&
                  newX >= 0 && newX < 9 &&
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

      for (let y = 0; y < 9; y++) {
          for (let x = 0; x < 9; x++) {
              if (this.board[y][x] === 0) continue;

              for (const [dir1, dir2] of directions) {
                  let count = 1;
                  let lineCoords = [[y, x]];

                  for (const [dy, dx] of [dir1, dir2]) {
                      let ny = y + dy, nx = x + dx;
                      while (ny >= 0 && ny < 9 && nx >= 0 && nx < 9 && this.board[ny][nx] === this.board[y][x]) {
                          count++;
                          lineCoords.push([ny, nx]);
                          ny += dy;
                          nx += dx;
                      }
                  }

                  if (count >= 5) {
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

      for (let y = 0; y < 9; y++) {
          for (let x = 0; x < 9; x++) {
              const cell = document.createElement('div');
              cell.className = 'cell';
              cell.dataset.x = x;
              cell.dataset.y = y;

              if (this.board[y][x] !== 0) {
                  const colorIndex = this.board[y][x] - 1;
                  if (colorIndex >= 0 && colorIndex < this.colors.length) {
                      const ball = document.createElement('div');
                      ball.className = 'ball';
                      ball.style.backgroundColor = this.colors[colorIndex];
                      cell.appendChild(ball);
                      console.log(`球在位置 (${x}, ${y})，顏色: ${this.colors[colorIndex]}`);
                  } else {
                      console.error(`無效的顏色索引：${colorIndex + 1}`);
                  }
              } else {
                  console.log(`位置 (${x}, ${y}) 是空的`);
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
          if (colorIndex >= 1 && colorIndex <= this.colors.length) {
              const ball = document.createElement('div');
              ball.className = 'ball preview-ball';
              ball.style.backgroundColor = this.colors[colorIndex - 1];
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
      console.log("檢查棋盤狀態:");
      for (let y = 0; y < 9; y++) {
          for (let x = 0; x < 9; x++) {
              if (this.board[y][x] === undefined) {
                  console.error(`棋盤位置 (${y}, ${x}) 出現未定義的狀態`);
              }
          }
      }
  }

  isGameOver() {
      // 檢查棋盤是否已滿
      for (let y = 0; y < 9; y++) {
          for (let x = 0; x < 9; x++) {
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
      this.board = Array(9).fill().map(() => Array(9).fill(0));
      this.score = 0;
      this.selectedCell = null;
      this.nextBalls = [];
      this.generateNextBalls();
      this.addRandomBalls(5);
      this.render();

      const gameOverElement = document.getElementById('game-over-message');
      if (gameOverElement) {
          gameOverElement.remove();
      }
  }

  handleCellClick(x, y) {
      if (this.selectedCell) {
          if (this.selectedCell.x === x && this.selectedCell.y === y) {
              // 如果點擊的是已選中的球，取消選擇
              document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.remove('selected');
              this.selectedCell = null;
          } else if (this.move(this.selectedCell.x, this.selectedCell.y, x, y)) {
              // 如果是有效移動，執行移動
              document.querySelector(`[data-x="${this.selectedCell.x}"][data-y="${this.selectedCell.y}"]`).classList.remove('selected');
              this.selectedCell = null;
          } else {
              // 如果是無效移動，選中新的球（如果點擊的是球）
              if (this.board[y][x] !== 0) {
                  document.querySelector(`[data-x="${this.selectedCell.x}"][data-y="${this.selectedCell.y}"]`).classList.remove('selected');
                  this.selectedCell = { x, y };
                  document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add('selected');
              }
          }
      } else if (this.board[y][x] !== 0) {
          // 如果沒有選中的球，而且點擊的是球，則選中該球
          this.selectedCell = { x, y };
          document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList.add('selected');
      }
  }
}

// 使用示例
const game = new ColorLines();
game.init();
