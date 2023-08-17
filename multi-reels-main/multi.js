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
  sprites = [];
for (let i = 0; i < tableDimX + 1; i++) {
  board[i] = new Array(tableDimY);
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

let availableSymbols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
  for (let i = 0; i <= tableDimX; i++) {
    for (let j = 0; j <= tableDimY; j++) {
      randomSymbol = generateRandomNumber();
      board[i][j] = {
        x: (i - 1) * cellWidth + centeredWidth,
        y: (j - 1) * cellHeight + centeredHeight,
        img: symbols[randomSymbol],
      };
      c.drawImage(
        symbols[randomSymbol],
        0,
        0,
        symbols[randomSymbol].width,
        symbols[randomSymbol].height,
        (i - 1) * cellWidth + centeredWidth,
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
  animatesPerSecond = 40,
  slowingAnimateTime = 20,
  spinActive = false,
  spaceBlocked = false,
  speed = canvas.height / 20,
  slowingSpeed = speed / 4;

let animationData = [];
for (let i = 0; i <= tableDimX; i++) {
  animationData.push({
    lastAnimate: animatesPerSecond + i * slowingAnimateTime,
    movementSpeed: speed,
  });
}

function drawSymbol(currentSymbol, i, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight;
  }
  if (animateCounter + 1 === animationData[i].lastAnimate)
    currentSymbol.y = findClosestValue(currentSymbol.y);
  c.drawImage(
    currentSymbol.img,
    0,
    0,
    currentSymbol.img.width,
    currentSymbol.img.height,
    (i - 1) * cellWidth + centeredWidth,
    currentSymbol.y,
    symbolWidth,
    symbolHeight
  );
  board[i][j] = currentSymbol;
  currentSymbol.y += animationData[i].movementSpeed;
}

function animateSymbols() {
  if (animateCounter === animationData[tableDimX].lastAnimate) {
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    spinActive = false;
    checkWin();
  } else {
    for (let i = 0; i <= tableDimX; i++) {
      if (animateCounter + 1 === animationData[i].lastAnimate)
        animationData[i].movementSpeed = 0;
      if (animateCounter === animationData[i].lastAnimate - slowingAnimateTime)
        animationData[i].movementSpeed = slowingSpeed;
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

let symbolNum = 0;

function centerSymbols() {
  for (let i = 0; i <= tableDimX; i++) {
    c.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
    while (symbolNum <= tableDimY) {
      currentSymbol = board[i][symbolNum];
      if (animationData[i].movementSpeed <= speed)
        currentSymbol.y = findClosestValue(currentSymbol.y);
      c.drawImage(
        currentSymbol.img,
        0,
        0,
        currentSymbol.img.width,
        currentSymbol.img.height,
        (i - 1) * cellWidth + centeredWidth,
        currentSymbol.y,
        symbolWidth,
        symbolHeight
      );
      board[i][symbolNum] = currentSymbol;
      symbolNum += 1;
    }
    symbolNum = 0;
  }
}

let value;

function findClosestValue(y) {
  value = tops.reduce((current, previous) =>
    Math.abs(current - y) < Math.abs(previous - y) ? current : previous
  );
  return value;
}

function animateStoppingSymbols() {
  if (animateCounter === slowingAnimateTime) {
    centerSymbols();
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    spaceBlocked = false;
    checkWin();
  } else {
    for (let i = 0; i <= tableDimX; i++) {
      c.clearRect(i * cellWidth, 0, cellWidth, canvas.height);
      for (let j = 0; j <= tableDimY; j++) {
        currentSymbol = board[i][j];
        drawSymbol(currentSymbol, i, j);
      }
    }
    animateId = requestAnimationFrame(animateStoppingSymbols);
    animateCounter += 1;
  }
}

let tops = [];
for (let i = 0; i <= tableDimX; i++) {
  tops[i] = (i - 1) * cellHeight + centeredHeight;
}

let symbolNumber = 1,
  animatingSymbols = [];

function spin() {
  getImages(0, false);
  spinActive = true;
  animationData.map((ad) => {
    ad.movementSpeed = speed;
    return ad;
  });
  winC.clearRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  winCanvas.style.display = "none";
  currentTime = lastRender = Date.now();
  animatingSymbols = [];
  animateSymbols();
}

function checkWin() {
  currentSprite = sprites.find((sprite) =>
    sprite.src.includes(`${symbolNumber}.png`)
  );
  setTimeout(animateWin, 300);
}

function makeShadows() {
  c.globalAlpha = 0.5;
  for (let i = 0; i < animatingSymbols.length; i++) {
    c.clearRect(
      animatingSymbols[i].x,
      animatingSymbols[i].y,
      symbolWidth,
      symbolHeight
    );
  }
  c.fillRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  c.globalAlpha = 1;
}

function animateWin() {
  currentTime = lastRender = Date.now();
  for (let i = 0; i <= tableDimX; i++) {
    for (let j = 0; j <= tableDimY; j++) {
      currentSymbol = board[i][j];
      if (
        currentSymbol.img.src.includes(`${symbolNumber}.png`) &&
        currentSymbol.y >= 0 &&
        i !== 0
      )
        animatingSymbols.push(currentSymbol);
    }
  }
  if (animatingSymbols.length !== 0) {
    winCanvas.style.display = "block";
    makeShadows();
    animateWinningSymbols();
  }
}

let currentSprite,
  spriteAnimateCounter = 0,
  spriteAnimateTime = 40;

function animateWinningSymbols() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter++;
    lastRender = Date.now();
  }
  if (spriteAnimateCounter >= 20) spriteAnimateCounter = 0;
  for (let i = 0; i < animatingSymbols.length; i++) {
    winC.clearRect(
      animatingSymbols[i].x,
      animatingSymbols[i].y,
      symbolWidth,
      symbolHeight
    );
    winC.drawImage(
      currentSprite,
      0,
      spriteAnimateCounter * spriteDim,
      spriteDim,
      spriteDim,
      animatingSymbols[i].x,
      animatingSymbols[i].y,
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
}

function resizeElementsMain() {
  mainContainer.style.width = gameWidth + "px";
  mainContainer.style.height = gameHeight + "px";
}

function fullResize() {
  resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
  resizeElementsMain();
}

addEventListener("load", () => {
  onloadScale = innerWidth / innerHeight;
  fullResize();
  let interval = setInterval(() => {
    if (imagesLoaded) {
      imagesLoaded = false;
      drawImages(false);
      clearInterval(interval);
    }
  });
});

function gameManipulation(e) {
  if (e.code === "Space" && !spinActive) {
    cancelAnimationFrame(spriteAnimateId);
    spin();
  } else if (e.code === "Space" && spinActive) {
    spaceBlocked = true;
    animationData.map((ad) => {
      if (ad.movementSpeed !== 0) ad.movementSpeed = speed / 3;
      return ad;
    });
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    animateStoppingSymbols();
    spinActive = false;
  }
}

addEventListener("keypress", (e) => {
  if (!spaceBlocked) gameManipulation(e);
});

window.onresize = () => {
  onloadScale = innerWidth / innerHeight;
  fullResize();
};
