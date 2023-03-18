let gameState = 'running';
let highScore = 0;

let score = 0;
const scoreDisplay = document.getElementById('score');

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

const resolution = 20;
const tileSize = canvas.width / resolution;

let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = [];

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && velocity.y === 0) velocity = { x: 0, y: -1 };
  if (event.key === 'ArrowDown' && velocity.y === 0) velocity = { x: 0, y: 1 };
  if (event.key === 'ArrowLeft' && velocity.x === 0) velocity = { x: -1, y: 0 };
  if (event.key === 'ArrowRight' && velocity.x === 0) velocity = { x: 1, y: 0 };
});

function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, 1000 / (10 + score * 0.3));
}


function update() {
  if (gameState === 'game-over') return;

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (head.x < 0 || head.x >= resolution || head.y < 0 || head.y >= resolution || checkCollision(head, snake.slice(1))) {
    gameState = 'game-over';
    if (score > highScore) {
      highScore = score;
    }
    return;
  }

  snake.unshift(head);

  let hasEatenApple = false;
  for (let i = 0; i < food.length; i++) {
    if (head.x === food[i].x && head.y === food[i].y) {
      food.splice(i, 1);
      hasEatenApple = true;
      scoreDisplay.textContent = ++score;
      break;
    }
  }

  // Only remove the tail if the snake has not eaten an apple
  if (!hasEatenApple) {
    snake.pop();
  }
}


function checkCollision(head, snakeBody) {
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeBody[i].x === head.x && snakeBody[i].y === head.y) {
      return true;
    }
  }
  return false;
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'lime';
  for (const segment of snake) {
    ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
  }

  ctx.fillStyle = 'red';
// Draw all apples
  for (const apple of food) {
    ctx.fillRect(apple.x * tileSize, apple.y * tileSize, tileSize, tileSize);
  }
  if (gameState === 'game-over') {
    drawGameOver();
  }
}


function placeFood() {
  if (food.length < 10) {
    const newFood = {
      x: Math.floor(Math.random() * resolution),
      y: Math.floor(Math.random() * resolution),
    };

    // Check if the new food position overlaps with the snake or other apples
    let isOverlapping = false;
    for (const segment of snake) {
      if (newFood.x === segment.x && newFood.y === segment.y) {
        isOverlapping = true;
        break;
      }
    }

    for (const apple of food) {
      if (newFood.x === apple.x && newFood.y === apple.y) {
        isOverlapping = true;
        break;
      }
    }

    if (!isOverlapping) {
      food.push(newFood);
      scoreDisplay.textContent = ++score;
    } else {
      placeFood();
    }
  }
}

function spawnFood() {
  if (gameState !== 'game-over') {
    placeFood();
  }

  // Schedule the next apple spawn at a random interval between 0.5 and 4 seconds
  setTimeout(spawnFood, (Math.random() * 3500) + 500);
}

function restartGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  food = { x: 15, y: 15 };
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


const restartButton = document.getElementById('restart-button');
restartButton.addEventListener('click', restartGame);

gameLoop();
spawnFood();