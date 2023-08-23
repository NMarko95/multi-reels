const canvas = document.querySelector(".main-canvas");
const c = canvas.getContext("2d");

const winCanvas = document.querySelector(".win-canvas");
const winC = winCanvas.getContext("2d");

const mainContainer = document.querySelector(".main");

let tableDimX = 5,
  tableDimY = 4,
  spriteDim = 260;

let image, animateId, spriteAnimateId;

let board = [],
  sprites = [],
  newBoard = [];

for (let i = 0; i < tableDimX; i++) {
  board[i] = new Array(tableDimX);
  newBoard[i] = new Array(tableDimX - 1);
}

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
  const randomNumber = Math.floor(Math.random() * availableSymbols.length);
  return randomNumber;
}

let symbols = [],
  imagesLoaded = false;

let availableSymbols = [5, 7, 8];

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

function drawImages() {
  for (let i = 0; i < tableDimX; i++) {
    for (let j = 0; j <= tableDimY; j++) {
      randomSymbol = generateRandomNumber();
      board[i][j] = {
        x: i * cellWidth + centeredWidth,
        y: (j - 1) * cellHeight + centeredHeight,
        img: symbols[randomSymbol],
      };
      c.drawImage(
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

let currentImg = generateRandomNumber(),
  animationId;

let animateCounter = 0,
  currentSymbol,
  fullAnimateCircle = 58,
  animateModuo = fullAnimateCircle % 10,
  slowingAnimateTime = tableDimX * tableDimY,
  spaceBlocked = false,
  spacePressed = false,
  speed = canvas.height / (tableDimX * tableDimY),
  slowingSpeed = speed / tableDimX;

let animationData = [],
  currentTop;

for (let i = 0; i < tableDimX; i++) {
  animationData.push({
    lastAnimate: fullAnimateCircle + i * slowingAnimateTime,
    movementSpeed: speed,
  });
}

function drawSymbol(currentSymbol, i, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight;
  }
  if (animationData[i].movementSpeed === slowingSpeed) {
    currentTop = findClosestValue(currentSymbol.y);
    if (currentSymbol.y + animationData[i].movementSpeed > currentTop) {
      currentSymbol.y = currentTop;
      animationData[i].movementSpeed = 0;
    }
  }
  c.drawImage(
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
      if (
        !isStopping &&
        animateCounter === animationData[i].lastAnimate - slowingAnimateTime &&
        animateCounter % 10 === animateModuo
      )
        animationData[i].movementSpeed = slowingSpeed;
      else if (
        isStopping &&
        animateCounter >= tableDimX * tableDimY &&
        animateCounter % 10 === animateModuo
      ) {
        if (
          animationData[i].movementSpeed === speed ||
          animationData[i].movementSpeed === slowingSpeed
        )
          animationData[i].movementSpeed = slowingSpeed;
      }
      c.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
      for (let j = 0; j <= tableDimY; j++) {
        currentSymbol = board[i][j];
        drawSymbol(currentSymbol, i, j);
      }
    }
    animateId = requestAnimationFrame(animateSymbols);
    animateCounter += 1;
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

let animatingSymbols = [];

function spin() {
  getImages(0, false);
  spaceBlocked = true;
  spriteAnimateCounter = currentIndexWinning = 0;
  winningLines = animatingSymbols = [];
  animationData.map((ad) => {
    ad.movementSpeed = speed;
    return ad;
  });
  winC.clearRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  winCanvas.style.display = "none";
  currentTime = lastRender = Date.now();
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
  if (winningLines.length !== 0) animateWin();
  setTimeout(() => (spaceBlocked = false), 200);
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

let currentSymbolImg,
  winningLines = [],
  currentWinningLine = [],
  currentCompareSymbol;

function makeShadows() {
  c.globalAlpha = 0.5;
  c.fillRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  c.globalAlpha = 1;
}

function animateWin() {
  winC.clearRect(0, 0, winCanvas.width, winCanvas.height);
  currentTime = lastRender = Date.now();
  findCorrectSprite(winningLines[0][0].img.src);
  makeShadows();
  winCanvas.style.display = "block";
  drawWinningLines(currentIndexWinning);
  animateWinningSymbols();
}

winC.strokeStyle = "yellow";
winC.lineWidth = 3;

function drawWinningLines(index) {
  winC.beginPath();
  for (let i = 0; i < winningLines[index].length - 1; i++) {
    winC.moveTo(
      winningLines[index][i].x + symbolWidth / 2,
      winningLines[index][i].y + symbolHeight / 2
    );
    winC.lineTo(
      winningLines[index][i + 1].x + symbolWidth / 2,
      winningLines[index][i + 1].y + symbolHeight / 2
    );
  }
  winC.stroke();
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
  currentIndexWinning = 0;

function animateWinningSymbols() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter++;
    lastRender = Date.now();
  }
  if (spriteAnimateCounter >= 20) {
    winC.clearRect(0, 0, winCanvas.width, winCanvas.height);
    spriteAnimateCounter = 0;
    currentIndexWinning++;
    if (currentIndexWinning === winningLines.length) currentIndexWinning = 0;
    findCorrectSprite(winningLines[currentIndexWinning][0].img.src);
    drawWinningLines(currentIndexWinning);
  }
  for (let i = 0; i < winningLines[currentIndexWinning].length; i++) {
    winC.clearRect(
      winningLines[currentIndexWinning][i].x,
      winningLines[currentIndexWinning][i].y,
      symbolWidth,
      symbolHeight
    );
    winC.drawImage(
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

addEventListener("keypress", (e) => {
  if (e.code === "Space") {
    if (spaceBlocked && spacePressed) {
      spacePressed = false;
      isStopping = true;
    }
    if (!spaceBlocked) {
      spacePressed = true;
      cancelAnimationFrame(spriteAnimateId);
      spin();
    }
  }
});

window.onresize = () => {
  onloadScale = innerWidth / innerHeight;
  resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
};
