const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const mainContainer = document.querySelector(".main");

let tableDimX = 5,
  tableDimY = 4,
  spriteDim = 260;

let image, animateId, spriteAnimateId;

let board = [];
for (let i = 0; i < tableDimX + 1; i++) {
  board[i] = new Array(tableDimY);
}

let currentTime, lastRender;

canvas.height = spriteDim * tableDimY;
canvas.width = spriteDim * tableDimX;

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
  animatesPerSecond = 30,
  slowingAnimateTime = 15,
  spaceBlocked = false;

let animationData = [];
for (let i = 0; i <= tableDimX; i++) {
  animationData.push({
    lastAnimate: animatesPerSecond + i * slowingAnimateTime,
    movementSpeed: canvas.height / 20,
  });
}

function drawSymbol(currentSymbol, i, j) {
  if (currentSymbol.y >= canvas.height) {
    currentImg = generateRandomNumber();
    currentSymbol.img = symbols[currentImg];
    currentSymbol.y = -cellHeight;
  }
  c.drawImage(
    currentSymbol.img,
    0,
    0,
    currentSymbol.img.width,
    currentSymbol.img.height,
    (i - 1) * cellWidth + centeredWidth,
    animateCounter + 1 === animationData[i].lastAnimate
      ? currentSymbol.y + canvas.height / 20
      : currentSymbol.y,
    symbolWidth,
    symbolHeight
  );
  board[i][j] =
    animateCounter + 1 === animationData[i].lastAnimate
      ? { ...currentSymbol, y: (currentSymbol.y += canvas.height / 20) }
      : currentSymbol;
  currentSymbol.y += animationData[i].movementSpeed;
}

function animateSymbols() {
  if (animateCounter === animationData[tableDimX].lastAnimate) {
    animateCounter = 0;
    cancelAnimationFrame(animateId);
    spaceBlocked = false;
  } else {
    for (let i = 0; i <= tableDimX; i++) {
      if (animateCounter + 1 === animationData[i].lastAnimate)
        animationData[i].movementSpeed = 0;
      if (animateCounter === animationData[i].lastAnimate - slowingAnimateTime)
        animationData[i].movementSpeed = canvas.height / 60;
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

function spin() {
  animationData.map((ad) => {
    ad.movementSpeed = canvas.height / 20;
    return ad;
  });
  document.body.style.pointerEvents = "none";
  currentTime = lastRender = Date.now();
  animateSymbols();
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

addEventListener("keydown", (e) => {
  if (e.code === "Space" && !spaceBlocked) {
    cancelAnimationFrame(spriteAnimateId);
    spaceBlocked = true;
    spin();
  }
});

window.onresize = () => {
  onloadScale = innerWidth / innerHeight;
  fullResize();
};
