const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restart-button');

const resolution = 20;
const tileSize = canvas.width / resolution;
const maxApples = 10;
const minSpawnInterval = 500; // 0.5 seconds
const maxSpawnInterval = 4000; // 4 seconds

let gameState = 'running';
let highScore = 0;
let score = 0;
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = [];

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

document.addEventListener('keydown', (event) => {
  const newVelocity = directions[event.key];
  if (newVelocity && (velocity.x !== -newVelocity.x || velocity.y !== -newVelocity.y)) {
    velocity = newVelocity;
  }
});

restartButton.addEventListener('click', restartGame);

function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, 1000 / (10 + score * 0.3));
}

function update() {
  if (gameState === 'game-over') return;

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
  if (isOutOfBounds(head) || checkCollision(head, snake.slice(1))) {
    setGameOver();
    return;
  }

  snake.unshift(head);
  const appleIndex = findApple(head);
  if (appleIndex !== -1) {
    food.splice(appleIndex, 1);
    incrementScore();
  } else {
    snake.pop();
  }
}

function isOutOfBounds(point) {
  return point.x < 0 || point.x >= resolution || point.y < 0 || point.y >= resolution;
}

function checkCollision(head, snakeBody) {
  return snakeBody.some(segment => segment.x === head.x && segment.y === head.y);
}

function findApple(head) {
  return food.findIndex(apple => apple.x === head.x && apple.y === head.y);
}

function incrementScore() {
  scoreDisplay.textContent = ++score;
}

function setGameOver() {
  gameState = 'game-over';
  if (score > highScore) {
    highScore = score;
  }
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'lime';
  snake.forEach(segment => ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize));

  ctx.fillStyle = 'red';
  food.forEach(apple => ctx.fillRect(apple.x * tileSize, apple.y * tileSize, tileSize, tileSize));

  if (gameState === 'game-over') {
    drawGameOver();
  }
}

function placeFood() {
  if (food.length < maxApples) {
    const newFood = {
      x: Math.floor(Math.random() * resolution),
      y: Math.floor(Math.random() * resolution),
    };

    if (!checkCollision(newFood, snake) && !checkCollision(newFood, food)) {
      food.push(newFood);
    } else {
      placeFood();
    }
  }
}

function spawnFood() {
  if (gameState !== 'game-over') {
    placeFood();
  }

  // Schedule the next apple spawn at a random interval between minSpawnInterval and maxSpawnInterval
  setTimeout(spawnFood, Math.random() * (maxSpawnInterval - minSpawnInterval) + minSpawnInterval);
}

function restartGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  food = [];
  scoreDisplay.textContent = score = 0;
  gameState = 'running';
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);

  ctx.font = '24px Arial, sans-serif';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);

  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
}

gameLoop();
spawnFood();