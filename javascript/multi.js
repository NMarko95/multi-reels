const canvas = document.getElementsByClassName("main-canvas")[0];
const context = canvas.getContext("2d");
const information = document.getElementsByClassName("information")[0];
const mainContainerGamble =
  document.getElementsByClassName("main-container")[0];
const bankSpan = document.getElementsByClassName("bank-span")[0];
const winSpan = document.getElementsByClassName("win-span")[0];
winSpan.innerHTML = 0;

const betSpan = document.getElementsByClassName("bet-span")[0];
betSpan.innerHTML = 2.0;

const lineSpan = document.getElementsByClassName("line-span")[0];
const linesImages = document.getElementsByClassName("lines-images")[0];
const winCanvas = document.getElementsByClassName("win-canvas")[0];
const winContext = winCanvas.getContext("2d");
const mainContainer = document.getElementsByClassName("main")[0];
const gambleBtn = document.getElementsByClassName("gamble-btn")[0];
gambleBtn.disabled = true;

const takeWinBtn = document.getElementsByClassName("take-win")[0];
takeWinBtn.disabled = true;

let tableDimX = 5,
  tableDimY = 4,
  spriteDim = 260;

let image, animateId, spriteAnimateId;

let board = [],
  sprites = [],
  newBoard = [];

let scores = [
  {
    id: 2,
    multipliers: {
      x3: 0.5,
      x4: 1.25,
      x5: 5,
    },
  },
  {
    id: 3,
    multipliers: {
      x3: 0.5,
      x4: 1.25,
      x5: 5,
    },
  },
  {
    id: 6,
    multipliers: {
      x3: 0.25,
      x4: 0.75,
      x5: 2,
    },
  },
  {
    id: 5,
    multipliers: {
      x3: 0.25,
      x4: 0.75,
      x5: 2,
    },
  },
  {
    id: 7,
    multipliers: {
      x3: 0.25,
      x4: 0.75,
      x5: 2,
    },
  },
  {
    id: 8,
    multipliers: {
      x3: 0.25,
      x4: 0.75,
      x5: 2,
    },
  },
];

for (let i = 0; i < tableDimX; i++) {
  board[i] = new Array(tableDimX);
  newBoard[i] = new Array(tableDimX - 1);
}

let history = [];

let currentTime, lastRender;

canvas.height = winCanvas.height = spriteDim * tableDimY;
canvas.width = winCanvas.width = spriteDim * tableDimX;

let cellWidth = canvas.width / tableDimX;
let cellHeight = canvas.height / tableDimY;

let symbolHeight = cellHeight / 1.5;
let symbolWidth = cellWidth / 1.5;

let centeredHeight = (cellHeight - symbolHeight) / 2,
  centeredWidth = (cellWidth - symbolWidth) / 2;

let gameWidth, gameHeight;

function generateRandomNumber() {
  randomNumber = Math.floor(Math.random() * availableSymbols.length);
  return randomNumber;
}

let symbols = [],
  imagesLoaded = false;

let availableSymbols = [2, 3, 5, 6, 7];

let randomNumber, randomSymbol;

function getImages(counter, isSymbols) {
  if (counter === availableSymbols.length) {
    imagesLoaded = true;
    return;
  }
  image = new Image();
  image.setAttribute(
    "src",
    `./images/${isSymbols ? "Symbols" : "Sprites"}/${
      availableSymbols[counter]
    }.png`
  );
  image.onload = () => {
    if (isSymbols) symbols.push(image);
    else sprites.push(image);
    getImages(counter + 1, isSymbols);
  };
}

getImages(0, true);

takeWinBtn.addEventListener("click", () => {
  resetGame();
  drawImages(true);
  space.blocked = false;
  bank.amount += totalSum;
  totalSum = 0;
  bankSpan.innerHTML = bank.amount;
  winSpan.innerHTML = 0;
});

let currentImg = generateRandomNumber();

let animateCounter = 0,
  currentSymbol,
  animateTime = 49,
  animateModuo = animateTime % 10,
  slowingTime = 20,
  stoppingTimeout = 500,
  space = {
    blocked: false,
  },
  spacePressed = false,
  speed = canvas.height / (tableDimX * tableDimY),
  slowingSpeed = speed / tableDimX;

let animationData = [],
  currentTop;

for (let i = 0; i < tableDimX; i++) {
  animationData.push({
    lastAnimate: animateTime + i * slowingTime,
    movementSpeed: speed,
  });
}

let isStopping = false;

let value;

function findClosestValue(y) {
  value = undefined;
  for (let i = 0; i < tops.length - 1; i++) {
    if (y > tops[i] && y < tops[i + 1]) value = tops[i + 1];
  }
  if (value === undefined) value = tops[0];
  return value;
}

let tops = [];

for (let i = 0; i <= tableDimX; i++) {
  tops[i] = parseInt((i - 1) * cellHeight + centeredHeight);
}

function resetGame() {
  getImages(0, false);
  cancelAnimationFrame(spriteAnimateId);
  gambleBtn.disabled = true;
  takeWinBtn.disabled = true;
  space.blocked = true;
  spriteAnimateCounter = currentIndexWinning = 0;
  winningLines = [];
  winSpan.innerHTML = totalSum;
  animationData.map((ad) => {
    ad.movementSpeed = speed;
    return ad;
  });
  winContext.clearRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  winCanvas.style.display = "none";
  removeImageLines();
}

function spin() {
  resetGame();
  bank.amount -= currentBet;
  currentTime = lastRender = Date.now();
  if (totalSum !== 0) {
    bank.amount += totalSum;
    totalSum = 0;
    winSpan.innerHTML = totalSum;
  }
  bankSpan.innerHTML = bank.amount;
  animateSymbols();
}

let matchedSymbols;

let totalSum = 0,
  currentSum = 0,
  currentScore,
  currentBet = 2.0,
  bank = {
    amount: 5000.0,
  };
bankSpan.innerHTML = bank.amount;

let newColumn = [],
  isSubset;

let lastHeight = Math.round(canvas.height - cellHeight + centeredHeight + 1);

let winningLines = [],
  currentWinningLine = [];

function animateWin() {
  winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
  currentTime = lastRender = Date.now();
  findCorrectSprite(winningLines[0][0].img.src);
  makeShadows();
  winCanvas.style.display = "block";
  animateAllWinningSymbols();
}

winContext.strokeStyle = "yellow";
winContext.lineWidth = 1.5;

let currentSplitSrc, currentImgNumber;

function findCorrectSprite(src) {
  currentSplitSrc = src.split(".png")[0];
  currentImgNumber = currentSplitSrc[currentSplitSrc.length - 1];
  currentSprite = sprites.find((sprite) =>
    sprite.src.includes(`${currentImgNumber}.png`)
  );
}

let currentSprite,
  spriteAnimateCounter = 0,
  spriteAnimateTime = 40,
  currentIndexWinning = 0,
  currentWinningImage;

function removeImageLines() {
  lineSpan.innerHTML = "";
  while (linesImages.firstChild !== null)
    linesImages.removeChild(linesImages.firstChild);
}

function drawLine(currentIndexWinning) {
  removeImageLines();
  lineSpan.innerHTML = `Line ${currentIndexWinning + 1}:`;
  for (let i = 0; i < winningLines[currentIndexWinning].length; i++) {
    currentWinningImage = document.createElement("img");
    currentWinningImage.src = winningLines[currentIndexWinning][i].img.src;
    linesImages.appendChild(currentWinningImage);
  }
}

let onloadScale;

let aspectRatioScreen = {
  widthScale: 16,
  heightScale: 9,
};

const ASPECT_RATIO_MAIN = 16 / 9;

function resizeHandler() {
  onloadScale = innerWidth / innerHeight;
  resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
}

addEventListener("load", () => {
  onloadScale = innerWidth / innerHeight;
  resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
  let interval = setInterval(() => {
    if (imagesLoaded) {
      imagesLoaded = false;
      drawImages(false);
      clearInterval(interval);
    }
  });
});

addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (space.blocked && spacePressed) {
      spacePressed = false;
      isStopping = true;
    }
    if (!space.blocked) {
      spacePressed = true;
      cancelAnimationFrame(spriteAnimateId);
      spin();
    }
  }
});

window.onresize = resizeHandler;
