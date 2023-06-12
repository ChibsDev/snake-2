// select elements
const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');
// select cvs 
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext("2d"); 

//add border 
cvs.style.border = '1px solid #fff';

// cvs dimensions
const width = cvs.width;
const height = cvs.height;

// game vars 
const FPS = 1000/15;
let gameLoop;
const squareSize = 20;
let gameStarted = false; 

// draw board

// game color 
let boardColor = '#000000', headColor = '#FFF', bodyColor = '#999'

//direction 
let currentDirection = '';
let directionQueue = [];
const directions = {
    RIGHT : 'ArrowRight',
    LEFT : 'ArrowLeft',
    UP : 'ArrowUp',
    DOWN : 'ArrowDown',

}


function drawboard() {
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, width, height)
}

// drae square 

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);

    ctx.strokeStyle = boardColor;
    ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

// snake
let snake = [
    { x :2 , y :0}, // Head
    { x :1 , y :0}, // Body
    { x :0 , y :0}, // Tail
];
function drawSnake() {
   snake.forEach((square, index) => {
    const color = index === 0 ? headColor : bodyColor;
    drawSquare(square.x, square.y, color);
   }) 
}
function moveSnake() {
    if (!gameStarted) return;

    const head = { ...snake[0] };

    //consume the direction
    if ( directionQueue.length) {
            currentDirection = directionQueue.shift();
        }
    //change head position
    switch(currentDirection){
        case directions.RIGHT:
            head.x += 1;
            break;
        case directions.LEFT:
            head.x -= 1;
            break;
        case directions.UP:
            head.y -= 1;
            break;
        case directions.DOWN:
            head.y += 1;
            break;
    }

    if ( hasEaten() ) {
        food = createFood();

    } else {
          // remove tail 
          snake.pop(); 
    }

      
    //unshift new head
        snake.unshift(head);
}

function hasEaten() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

document.addEventListener('keyup' , setDirection);
function setDirection(e){
    const newDirection = e.key;
    const oldDirection = currentDirection;

   if (
        (newDirection === directions.LEFT && oldDirection !== directions.RIGHT)
        || 
        (newDirection === directions.RIGHT && oldDirection !== directions.LEFT)    
        || 
        (newDirection === directions.UP && oldDirection !== directions.DOWN)
        || 
        (newDirection === directions.DOWN && oldDirection !== directions.UP)
   ){
        if ( !gameStarted) {
            gameStarted = true;
            gameLoop = setInterval(frame,FPS);
        }

        directionQueue.push(newDirection);
   }
}

// Horizontal and vertical cvs squares 
const horizontalSq = width / squareSize;
const verticalSq = height / squareSize;

// food
let food = createFood();
function createFood() {
    let food = {
        x : Math.floor(Math.random() * horizontalSq),
        y : Math.floor(Math.random() * verticalSq),
    };

    while (
        snake.some( (square) => square.x === food.x && square.y === food.y) 
        ) { 
            food = {
                x : Math.floor(Math.random() * horizontalSq),
                y : Math.floor(Math.random() * verticalSq),
            }; 
        }

    return food;
}
function drawFood() {
    drawSquare(food.x, food.y, '#F95700');
}

//score 
const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;
function renderScore() {
     score = snake.length - initialSnakeLength;
    scoreEl.innerHTML = `${score}`
    highScoreEl.innerHTML = `${highScore}`
}

// hit wall 
function hitWall() {
    const head = snake[0];

    return (
        head.x < 0 ||
        head.x >= horizontalSq||
        head.y < 0 ||
        head.y >= verticalSq

    );
}

function hitSelf() {
    const snakeBody = [...snake];
    const head = snakeBody.shift();

   return snakeBody.some( (square) => square.x === head.x && square.y === head.y );
}

// game over
function gameOver() {

    const scoreEl = document.querySelector('.game-over-score .current');
    const highScoreEl = document.querySelector(
      '.game-over-score .high'
    );
  
 
    highScore = Math.max(score, highScore);
    localStorage.setItem('high-score', highScore);
  
    // update the score and high score el
    scoreEl.innerHTML = ` ${score}`;
    highScoreEl.innerHTML = ` ${highScore}`;
  
    // show game over el
    gameOverEl.classList.remove('hide');
  }

//loop
function frame() {

    drawboard();
    drawFood();
    moveSnake();
    drawSnake();
    renderScore();

    if ( hitWall() || hitSelf() ) {
        clearInterval(gameLoop);
        gameOver();
    }
}
frame();

// restart the game
playAgainBtn.addEventListener('click', restartGame);
function restartGame() {
  // reset snake length and position
  snake = [
    { x: 2, y: 0 }, // Head
    { x: 1, y: 0 }, // Body
    { x: 0, y: 0 }, // Tail
  ];

  // reset directions
  currentDirection = '';
  directionsQueue = [];

  // hide the game over screen
  gameOverEl.classList.add('hide');

  // reset the gameStarted state to false
  gameStarted = false;

  // re-draw everything
  frame();
}