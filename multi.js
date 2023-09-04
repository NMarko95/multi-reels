import { gamble } from "./gamble.js";

const canvas = document.querySelector(".main-canvas");
const context = canvas.getContext("2d");

const information = document.getElementsByClassName("information")[0];

const mainContainerGamble =
  document.getElementsByClassName("main-container")[0];

const bankSpan = document.getElementsByClassName("bank-span")[0];
const winSpan = document.getElementsByClassName("win-span")[0];
winSpan.innerHTML = 0;
const betSpan = document.getElementsByClassName("bet-span")[0];
betSpan.innerHTML = 2.0;

const winCanvas = document.querySelector(".win-canvas");
const winContext = winCanvas.getContext("2d");

const mainContainer = document.querySelector(".main");

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

function drawImages(isTakingWin) {
  if (isTakingWin) {
    context.clearRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
    for (let i = 0; i < tableDimX; i++) {
      for (let j = 0; j < tableDimY; j++) {
        currentSymbol = newBoard[i][j];
        context.drawImage(
          currentSymbol?.img,
          0,
          0,
          currentSymbol?.img.width,
          currentSymbol?.img.height,
          i * cellWidth + centeredWidth,
          j * cellHeight + centeredHeight,
          symbolWidth,
          symbolHeight
        );
      }
    }
  } else {
    for (let i = 0; i < tableDimX; i++) {
      for (let j = 0; j <= tableDimY; j++) {
        randomSymbol = generateRandomNumber();
        board[i][j] = {
          x: i * cellWidth + centeredWidth,
          y: (j - 1) * cellHeight + centeredHeight,
          img: symbols[randomSymbol],
        };
        context.drawImage(
          symbols[randomSymbol],
          0,
          0,
          symbols[randomSymbol].width,
          symbols[randomSymbol].height,
          i * cellWidth + centeredWidth,
          (j - 1) * cellHeight + centeredHeight,
          symbolWidth,
          symbolHeight
        );
      }
    }
  }
}

const gambleBtn = document.querySelector(".gamble-btn");
gambleBtn.disabled = true;
gambleBtn.onclick = () => {
  resetGame();
  drawImages(true);
  space.blocked = true;
  mainContainer.style.opacity = 0;
  mainContainer.classList.remove("fadeIn");
  mainContainer.classList.add("fadeOut");
  setTimeout(() => {
    mainContainerGamble.classList.remove("fadeOut");
    mainContainerGamble.classList.add("fadeIn");
    cancelAnimationFrame(spriteAnimateId);
    mainContainerGamble.style.opacity = 1;
    mainContainerGamble.style.pointerEvents = "auto";
    mainContainer.style.pointerEvents = "none";
    winSpan.innerHTML = 0;
    gamble(totalSum, space, bank, bankSpan, history);
    totalSum = 0;
  }, 1000);
};

const takeWinBtn = document.getElementsByClassName("take-win")[0];
takeWinBtn.disabled = true;
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

function drawSymbol(currentSymbol, i, j) {
  if (animationData[i].movementSpeed === slowingSpeed) {
    currentTop = findClosestValue(currentSymbol.y);
    if (currentSymbol.y + animationData[i].movementSpeed > currentTop) {
      currentSymbol.y = currentTop;
      animationData[i].movementSpeed = 0;
    }
  }
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight;
  }
  context.drawImage(
    currentSymbol.img,
    0,
    0,
    currentSymbol.img.width,
    currentSymbol.img.height,
    i * cellWidth + centeredWidth,
    currentSymbol.y,
    symbolWidth,
    symbolHeight
  );
  board[i][j] = currentSymbol;
  currentSymbol.y += animationData[i].movementSpeed;
}

let isStopping = false;

function animateSymbols() {
  if (animationData[tableDimX - 1].movementSpeed === 0) {
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    checkWin();
  } else {
    for (let i = 0; i < tableDimX; i++) {
      if (!isStopping && animateCounter === animationData[i].lastAnimate)
        animationData[i].movementSpeed = slowingSpeed;
      else if (
        isStopping &&
        currentTime - lastRender > stoppingTimeout &&
        animateCounter % 10 === animateModuo &&
        animationData[i].movementSpeed === speed
      )
        animationData[i].movementSpeed = slowingSpeed;

      context.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
      for (let j = 0; j <= tableDimY; j++) {
        currentSymbol = board[i][j];
        drawSymbol(currentSymbol, i, j);
      }
    }
    animateId = requestAnimationFrame(animateSymbols);
    animateCounter += 1;
    currentTime = Date.now();
  }
}

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

function checkWin() {
  isStopping = false;
  rearrangeBoard();
  for (let j = 0; j < tableDimY; j++) {
    currentSymbol = newBoard[0][j];
    currentWinningLine = [];
    currentWinningLine.push(newBoard[0][j]);
    currentWinningLine.length = 1;
    matchedSymbols = true;
    checkWinningLines(1, j - 1);
    checkWinningLines(1, j);
    checkWinningLines(1, j + 1);
  }
  if (winningLines.length !== 0) {
    gambleBtn.disabled = false;
    takeWinBtn.disabled = false;
    sumWinnings();
    animateWin();
    setTimeout(() => (space.blocked = false), 1000);
  } else {
    setTimeout(() => (space.blocked = false), 200);
  }
}

let totalSum = 0,
  currentSum = 0,
  currentScore,
  currentBet = 2.0,
  bank = {
    amount: 5000.0,
  };
bankSpan.innerHTML = bank.amount;

function sumWinnings() {
  winningLines.forEach((line, i) => {
    currentSplitSrc = line[0].img.src.split(".png")[0];
    currentImgNumber = currentSplitSrc[currentSplitSrc.length - 1];
    currentScore = scores.find((score) => score.id == currentImgNumber);
    switch (line.length) {
      case 3:
        currentSum = currentScore.multipliers.x3 * currentBet;
        break;
      case 4:
        currentSum = currentScore.multipliers.x4 * currentBet;
        break;
      case 5:
        currentSum = currentScore.multipliers.x5 * currentBet;
        break;
    }
    totalSum += currentSum;
    currentSum = 0;
  });
  winSpan.innerHTML = totalSum;
}

function checkWinningLines(x, y) {
  matchedSymbols = true;
  while (x <= tableDimY && y >= 0 && y < tableDimY && matchedSymbols) {
    if (currentSymbol.img.src === newBoard[x][y].img.src) {
      currentWinningLine.push(newBoard[x][y]);
      if (x + 1 < tableDimX) {
        checkWinningLines(x + 1, y - 1);
        checkWinningLines(x + 1, y);
        checkWinningLines(x + 1, y + 1);
      }
      if (currentWinningLine.length >= 3 && !checkIfSubset())
        winningLines.push([...currentWinningLine]);
      currentWinningLine.pop();
      matchedSymbols = false;
    } else matchedSymbols = false;
  }

  return;
}

let newColumn = [],
  isSubset;

function checkIfSubset() {
  isSubset = false;
  for (let i = 0; i < winningLines.length && !isSubset; i++) {
    isSubset = currentWinningLine.every((element) =>
      winningLines[i].includes(element)
    );
  }
  return isSubset;
}

let lastHeight = Math.round(canvas.height - cellHeight + centeredHeight + 1);

function rearrangeBoard() {
  for (let i = 0; i < tableDimX; i++) {
    for (let j = 0; j <= tableDimY; j++) {
      if (board[i][j].y > 0 && board[i][j].y <= lastHeight) {
        newColumn.push(board[i][j]);
      }
    }
    newColumn.sort((a, b) => a.y - b.y);
    newBoard[i] = newColumn;
    newColumn = [];
  }
}

let winningLines = [],
  currentWinningLine = [];

function makeShadows() {
  context.globalAlpha = 0.5;
  context.fillRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  context.globalAlpha = 1;
}

function animateWin() {
  winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
  currentTime = lastRender = Date.now();
  findCorrectSprite(winningLines[0][0].img.src);
  makeShadows();
  winCanvas.style.display = "block";
  //animateAllWinningSymbols();
  drawWinningLines(currentIndexWinning);
  drawLine(currentIndexWinning);
  animateWinningSymbols();
}

function animateAllWinningSymbols() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter = 0;
    lastRender = Date.now();
    cancelAnimationFrame(spriteAnimateId);
    drawWinningLines(currentIndexWinning);
    drawLine(currentIndexWinning);
    animateWinningSymbols();
  }
  for (let i = 0; i < winningLines.length; i++) {
    findCorrectSprite(winningLines[i][0].img.src);
    drawWinningLines(i);
    for (let j = 0; j < winningLines[i].length; j++) {
      winContext.clearRect(
        winningLines[i][j].x,
        winningLines[i][j].y,
        symbolWidth,
        symbolHeight
      );
      winContext.drawImage(
        currentSprite,
        0,
        spriteAnimateCounter * spriteDim,
        spriteDim,
        spriteDim,
        winningLines[i][j].x,
        winningLines[i][j].y,
        symbolWidth,
        symbolHeight
      );
    }
  }
  spriteAnimateCounter++;
  currentTime = Date.now();
  spriteAnimateId = requestAnimationFrame(animateAllWinningSymbols);
}

winContext.strokeStyle = "yellow";
winContext.lineWidth = 1.5;

function drawWinningLines(index) {
  winContext.beginPath();
  for (let i = 0; i < winningLines[index].length - 1; i++) {
    winContext.moveTo(
      winningLines[index][i].x + symbolWidth / 2,
      winningLines[index][i].y + symbolHeight / 2
    );
    winContext.lineTo(
      winningLines[index][i + 1].x + symbolWidth / 2,
      winningLines[index][i + 1].y + symbolHeight / 2
    );
  }
  winContext.stroke();
}

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

const lineSpan = document.querySelector(".line-span");
const linesImages = document.querySelector(".lines-images");

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

function animateWinningSymbols() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter++;
    lastRender = Date.now();
  }
  if (spriteAnimateCounter >= 20) {
    winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
    spriteAnimateCounter = 0;
    currentIndexWinning++;
    if (currentIndexWinning === winningLines.length) currentIndexWinning = 0;
    findCorrectSprite(winningLines[currentIndexWinning][0].img.src);
    drawWinningLines(currentIndexWinning);
    drawLine(currentIndexWinning);
  }
  for (let i = 0; i < winningLines[currentIndexWinning].length; i++) {
    winContext.clearRect(
      winningLines[currentIndexWinning][i].x,
      winningLines[currentIndexWinning][i].y,
      symbolWidth,
      symbolHeight
    );
    winContext.drawImage(
      currentSprite,
      0,
      spriteAnimateCounter * spriteDim,
      spriteDim,
      spriteDim,
      winningLines[currentIndexWinning][i].x,
      winningLines[currentIndexWinning][i].y,
      symbolWidth,
      symbolHeight
    );
  }
  currentTime = Date.now();
  spriteAnimateId = requestAnimationFrame(animateWinningSymbols);
}

let onloadScale;

let aspectRatioScreen = {
  widthScale: 16,
  heightScale: 9,
};

const ASPECT_RATIO_MAIN = 16 / 9;

function resize(width, height, aspect) {
  if (width > height) {
    if (onloadScale > aspect) {
      gameHeight = height;
      gameWidth =
        (gameHeight * aspectRatioScreen.widthScale) /
        aspectRatioScreen.heightScale;
    } else {
      gameWidth = width;
      gameHeight =
        (gameWidth * aspectRatioScreen.heightScale) /
        aspectRatioScreen.widthScale;
    }
  } else {
    if (onloadScale > 1 / aspect) {
      gameHeight = outerHeight;
      gameWidth =
        (gameHeight * aspectRatioScreen.heightScale) /
        aspectRatioScreen.widthScale;
    } else {
      gameWidth = outerWidth;
      gameHeight =
        (gameWidth * aspectRatioScreen.widthScale) /
        aspectRatioScreen.heightScale;
    }
  }
  resizeElementsMain();
}

function resizeElementsMain() {
  mainContainer.style.width = gameWidth + "px";
  mainContainer.style.height = gameHeight + "px";
  information.style.width = canvas.style.width;
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

function resizeHandler() {
  onloadScale = innerWidth / innerHeight;
  resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
}
