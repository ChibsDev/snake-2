     //HOMEPAGE AND MODAL FUNCTIONS
  
const homepageBtns = document.querySelector('.homepage-btns');
const homepagePlayBtn = document.querySelector('.play');
const homepageSettingsBtn = document.querySelector('.settings');
const homepageRulesBtn = document.querySelector('.rules');
const homepageTitle = document.querySelector('.title');

homepagePlayBtn.addEventListener('click', startGame);
homepageSettingsBtn.addEventListener('click', openSettingsModal);
homepageRulesBtn.addEventListener('click', openRulesModal);

window.onload = function() {

  setTimeout(function() {
    homepageTitle.classList.add('fade-down');
    homepageTitle.classList.remove('zero-opacity');
  }, 3500);

  setTimeout(function() {
    homepageBtns.classList.add('fade-in-right');
    homepageBtns.classList.remove('zero-opacity');
  }, 5500);

}


function startGame() {
  const homepage = document.querySelector('.homepage');
  const container = document.querySelector('.container');
  homepage.classList.add('hide');
  container.classList.remove('hide');
  audio.pause();
  playIcon.src = './media/images/volume_off_FILL0_wght400_GRAD0_opsz48.png';
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.classList.remove('hide');
}

function openRulesModal() {
  const modal = document.getElementById('rules-modal');
  modal.classList.remove('hide');
}



// SELECT ELEMENTS 

const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');

// CANVAS AND CONTEXT 
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext("2d"); 
cvs.style.boxShadow = '0px 10px 13px -7px #000000, 5px 5px 15px 5px rgba(0,0,0,0)';

// CANVAS DIMENSIONS 
const width = cvs.width;
const height = cvs.height;

// GAME VARS
let FPS = 1000/15;
let gameLoop;
const squareSize = 20;
let gameStarted = false; 

// FPS VARS
let slowFPS = 1000 / 5;
let fasterFPS = 1000 / 10;
let normalFPS = 1000 / 15;

// SPEED FUNCTION
function updateFPS() {
  if (score < 3) {
    FPS = slowFPS;
  } else if (score >= 3 && score < 5) {
    FPS = fasterFPS;
  } else {
    FPS = normalFPS;
  }
}


//DIRECTION 
let currentDirection = '';
let directionQueue = [];
const directions = {
    RIGHT : 'ArrowRight',
    LEFT : 'ArrowLeft',
    UP : 'ArrowUp',
    DOWN : 'ArrowDown',

}


// GAME COLOUR  
let boardColor = '#000000', headColor = '#FFF', bodyColor = '#999'

// GAME BOARD
function drawboard() {
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, width, height)
    updateFPS();
}

// DRAW SQUARE
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);

    ctx.strokeStyle = boardColor;
    ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

// SNAKE
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
   ) {
       
        if ( !gameStarted) {
            
            gameStarted = true;
            gameLoop = setInterval(frame, FPS);
        }
        
        directionQueue.push(newDirection);
    
        updateFPS();

        clearInterval(gameLoop); 
        gameLoop = setInterval(frame, FPS);
        
      }
}

// Horizontal and vertical canvas squares 
const horizontalSq = width / squareSize;
const verticalSq = height / squareSize;

// FOOD 
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

//SCORE
const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;

function renderScore() {
     score = snake.length - initialSnakeLength;
    scoreEl.innerHTML = `🏅${score}`;
    highScoreEl.innerHTML = `🔥${highScore}`;
    updateFPS();

    
  const infoContentEl = document.getElementById('info-content');
  if (score === 3 || score === 5 || score === 7) {
    infoContentEl.innerHTML = 'How aobut a lil more speed?';
  } else {
    infoContentEl.innerHTML = '';
  }

}

// DETECT COLLISION
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

// GAME OVER
function gameOver() {

    const scoreEl = document.querySelector('.game-over-score .current');
    const highScoreEl = document.querySelector(
      '.game-over-score .high'
    );
  
 
    highScore = Math.max(score, highScore);
    localStorage.setItem('high-score', highScore);
    scoreEl.innerHTML = `🏅 ${score}`;
    highScoreEl.innerHTML = ` 🔥${highScore}`;
    gameOverEl.classList.remove('hide');
  }

// LOOP
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

// GAME RESET
playAgainBtn.addEventListener('click', restartGame);
function restartGame() {
  snake = [
    { x: 2, y: 0 }, // Head
    { x: 1, y: 0 }, // Body
    { x: 0, y: 0 }, // Tail
  ];

  // reset directions
  currentDirection = '';
  directionsQueue = [];

  gameOverEl.classList.add('hide');

  gameStarted = false;

  // re-draw everything
  frame();
}

//SETTINGS 

const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const closeRulesBtn = document.getElementById('close-rules');
const themeOptions = document.getElementsByName('theme');
const snakePreviewCanvas = document.getElementById('snakePreview');
const snakePreviewCtx = snakePreviewCanvas.getContext('2d');
const previewSquareSize = 20;
const previewCanvasWidth = previewSquareSize * 10;
const previewCanvasHeight = previewSquareSize * 10;

// Function to draw the snake preview
function drawSnakePreview() {
  snakePreviewCtx.clearRect(0, 0, snakePreviewCanvas.width, snakePreviewCanvas.height);

  const snakeHeadColor = headColor;
  const snakeBodyColor = bodyColor;

  // Calculate the center position of the canvas
  const centerX = Math.floor(snakePreviewCanvas.width / 2);
  const centerY = Math.floor(snakePreviewCanvas.height / 2);

  // Calculate the starting position of the snake's head
  const startX = centerX - Math.floor(snake.length / 2) * previewSquareSize;
  const startY = centerY - Math.floor(snake.length / 2) * previewSquareSize;

  // Draw head
  const head = snake[0];
  snakePreviewCtx.fillStyle = snakeHeadColor;
  snakePreviewCtx.fillRect(startX + head.x * previewSquareSize, startY + head.y * previewSquareSize, previewSquareSize, previewSquareSize);

  // Draw body
  for (let i = 1; i < snake.length; i++) {
    const segment = snake[i];
    snakePreviewCtx.fillStyle = snakeBodyColor;
    snakePreviewCtx.fillRect(startX + segment.x * previewSquareSize, startY + segment.y * previewSquareSize, previewSquareSize, previewSquareSize);
  }
}

//DIFFICULTY 

function setDifficulty(difficulty) {
  if (difficulty === 'easy') {
    slowFPS = 1000 / 2;
    fasterFPS = 1000 / 4;
    normalFPS = 1000 / 6;
  } else if (difficulty === 'normal') {
    slowFPS = 1000 / 5;
    fasterFPS = 1000 / 10;
    normalFPS = 1000 / 15;
  } else if (difficulty === 'hard') {
    slowFPS = 1000 / 10;
    fasterFPS = 1000 / 15;
    normalFPS = 1000 / 20;
  } else {
    slowFPS = 1000 / 5;
    fasterFPS = 1000 / 10;
    normalFPS = 1000 / 15;
  }
}

const easyButton = document.getElementById('easyButton');
const normalButton = document.getElementById('normalButton');
const hardButton = document.getElementById('hardButton');

function handleClick(event) {

  easyButton.classList.remove('active');
  normalButton.classList.remove('active');
  hardButton.classList.remove('active');

  
  event.target.classList.add('active');
}

easyButton.addEventListener('click', (event) => {
  setDifficulty('easy');
  handleClick(event);
  console.log("easy selected");
});

normalButton.addEventListener('click', (event) => {
  setDifficulty('normal');
  handleClick(event);
  console.log("normal selected");
});

hardButton.addEventListener('click', (event) => {
  setDifficulty('hard');
  handleClick(event);
  console.log("hard selected");
});




// THEMES 

function changeThemeColors() {
  const selectedTheme = document.querySelector('input[name="theme"]:checked');

  if (selectedTheme) {
    const theme = selectedTheme.value;

    switch (theme) {
      case 'theme1':
        boardColor = '#000000';
        headColor = '#FBBD08';
        bodyColor = '#95b82f';
        break;
      case 'theme2':
        boardColor = '#333';
        headColor = '#FFC107';
        bodyColor = '#FF9800';
        break;
      case 'theme3':
        boardColor = '#ff8e57';
        headColor = '#a333c8';
        bodyColor = '#f225a1';
        break;
      case 'theme4':
        boardColor = '#5276ca';
        headColor = '#00B5AD';
        bodyColor = '#00a5c5';
        break;
      default:
        boardColor = '#000000';
        headColor = '#FFF';
        bodyColor = '#999';
        break;
    }
  } else {
    boardColor = '#000000';
    headColor = '#FFF';
    bodyColor = '#999';
  }

  drawSnakePreview();
  drawboard();
  drawSnake();
  drawFood();
}

themeOptions.forEach(option => {
  option.addEventListener('change', changeThemeColors);
});

  

// SAVE THEME SETTINGS
function saveSettings() {
  changeThemeColors();
  closeSettingsModal();
}

function closeSettingsModal() {
  settingsModal.classList.add('hide');
}


saveSettingsBtn.addEventListener('click', saveSettings);
closeSettingsBtn.addEventListener('click', closeSettingsModal);

// SELECT AUDIO AND ICON CONTROL ELEMENTS
const audio = document.getElementById('backgroundAudio');
const audioControl = document.getElementById('audioControl');
const playIcon = document.getElementById('playIcon');


//RULES MODAL 

closeRulesBtn.addEventListener('click', closeRulesModal);

function closeRulesModal() {
  const modal = document.getElementById('rules-modal');
  modal.classList.add('hide');
}


// AUDIO TOGGLE
function toggleAudio() {
  if (audio.paused) {
    audio.play();
    playIcon.src = './media/images/volume_up_FILL0_wght400_GRAD0_opsz48.png';
  } else {
    audio.pause();
    playIcon.src = './media/images/volume_off_FILL0_wght400_GRAD0_opsz48.png';
  }
}

window.addEventListener('load', () => {
  audio.play();
  playIcon.src = './media/images/volume_up_FILL0_wght400_GRAD0_opsz48.png';
});


