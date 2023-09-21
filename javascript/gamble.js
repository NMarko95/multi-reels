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
    cancelAnimationFrame(idAnimateAllSprites);
    cancelAnimationFrame(spriteAnimateId);
    mainContainerGamble.style.opacity = 1;
    mainContainerGamble.style.pointerEvents = "auto";
    mainContainer.style.pointerEvents = "none";
    winSpan.innerHTML = 0;
    gamble(totalSum);
    totalSum = 0;
  }, 1000);
};

function gamble(gambleAmount) {
  const main = document.getElementsByClassName("main")[0];
  const mainContainer = document.getElementsByClassName("main-container")[0];
  const mainCanvas = document.getElementsByClassName("gamble-canvas")[0];
  const historyCanvas = document.getElementsByClassName("history-canvas")[0];

  const context = mainCanvas.getContext("2d");
  const historyContext = historyCanvas.getContext("2d");

  const imgDim = {
    width: 686,
    height: 976,
  };

  mainCanvas.width = imgDim.width;
  mainCanvas.height = imgDim.height;

  historyCanvas.width = imgDim.width * 4;
  historyCanvas.height = imgDim.height;

  let currentTime = Date.now(),
    lastRender = Date.now();

  let animationId;

  let black = "rgb(0, 0, 0)",
    red = "rgb(255, 0, 0)";

  let currentColor = red;

  let amount = gambleAmount,
    amountWin = amount * 2,
    attempts = 5;

  const text = document.getElementsByClassName("display-text")[0];
  text.innerHTML = "";
  const btns = document.querySelectorAll(".btn");

  const attemptsValue = document.getElementsByClassName("attempts-value")[0];
  attemptsValue.innerHTML = attempts;
  const gambleWinValue = document.getElementsByClassName("gamble-win-value")[0];
  gambleWinValue.innerHTML = amountWin;
  const gambleAmountValue = document.getElementsByClassName(
    "gamble-amount-value"
  )[0];
  gambleAmountValue.innerHTML = amount;

  disableSwitch(false);

  const takeWinBtn = document.getElementsByClassName("take-win-btn")[0];
  takeWinBtn.disabled = true;
  takeWinBtn.addEventListener("click", takeWinHandler);

  function takeWinHandler(e) {
    takeWin();
    e.target.blur();
  }

  function drawCard(isRed) {
    if (isRed) currentImg = imgRed;
    else currentImg = imgBlack;
    context.drawImage(
      currentImg,
      0,
      0,
      currentImg.width,
      currentImg.height,
      0,
      0,
      mainCanvas.width,
      mainCanvas.height
    );
  }

  function drawHistoryCard() {
    historyContext.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
    history.forEach((card, i) => {
      currentImg = card === red ? imgRed : imgBlack;
      historyContext.drawImage(
        currentImg,
        0,
        0,
        currentImg.width,
        currentImg.height,
        ((history.length - 1 - i) * historyCanvas.width) / 4,
        0,
        historyCanvas.width / 5,
        historyCanvas.height
      );
    });
  }

  let btn = document.getElementsByClassName("btn red")[0];
  btn.style.backgroundColor = red;

  btn = document.getElementsByClassName("btn black")[0];
  btn.style.backgroundColor = black;

  let imgBlack = new Image();
  imgBlack.src = "./images/black.png";

  let imgRed = new Image();
  imgRed.src = "./images/red.png";

  let currentImg;

  drawHistoryCard();

  function starting() {
    if (lastRender - currentTime >= 50) {
      if (currentColor === red) {
        currentColor = black;
        drawCard(false);
      } else {
        currentColor = red;
        drawCard(true);
      }
      currentTime = Date.now();
    }
    lastRender = Date.now();
    animationId = requestAnimationFrame(starting);
  }

  function addToHistory(color) {
    history.push(color);
    drawHistoryCard();
  }

  function takeWin() {
    cancelAnimationFrame(animationId);
    bank.amount += amount;
    bankSpan.innerHTML = bank.amount;
    text.innerHTML = "";
    buttons.forEach((btn) => btn.removeEventListener("click", buttonHandler));
    takeWinBtn.removeEventListener("click", takeWinHandler);
    mainContainer.style.pointerEvents = "none";
    mainContainer.classList.remove("fadeIn");
    mainContainer.classList.add("fadeOut");
    mainContainer.style.opacity = 0;
    setTimeout(() => {
      main.style.opacity = 1;
      main.style.pointerEvents = "auto";
      space.blocked = false;
      main.classList.remove("fadeOut");
      main.classList.add("fadeIn");
      return;
    }, 1000);
  }

  function checkWin(color) {
    if (currentColor === color) {
      attempts -= 1;
      text.innerHTML = "WIN";
      amount = amountWin;
      if (attempts < 5 && attempts > 0) takeWinBtn.disabled = false;
      amountWin = amount * 2;
      attemptsValue.innerHTML = attempts;
      gambleAmountValue.innerHTML = amount;
      gambleWinValue.innerHTML = amountWin;
      disableSwitch(true);
      mainContainer.style.pointerEvents = "none";
      setTimeout(() => {
        text.innerHTML = "";
        disableSwitch(false);
        mainContainer.style.pointerEvents = "auto";
        starting();
      }, 2000);
    } else {
      attempts = 0;
      amount = 0;
      amountWin = 0;
      text.innerHTML = "LOSE";
      attemptsValue.innerHTML = attempts;
      gambleAmountValue.innerHTML = amount;
      gambleWinValue.innerHTML = amountWin;
      mainContainer.style.pointerEvents = "none";
      disableSwitch(true);
      buttons.forEach((btn) => btn.removeEventListener("click", buttonHandler));
      takeWinBtn.removeEventListener("click", takeWinHandler);
      setTimeout(() => {
        mainContainer.classList.remove("fadeIn");
        mainContainer.classList.add("fadeOut");
        mainContainer.style.opacity = 0;
        setTimeout(() => {
          main.style.opacity = 1;
          main.style.pointerEvents = "auto";
          space.blocked = false;
          cancelAnimationFrame(animationId);
          main.classList.remove("fadeOut");
          main.classList.add("fadeIn");
          return;
        }, 1000);
      }, 2000);
    }
    addToHistory(currentColor);
  }

  function disableSwitch(condition) {
    btns.forEach((btn) => {
      btn.disabled = condition;
    });
  }

  let aspectRatioScreen = {
    widthScale: 16,
    heightScale: 9,
  };

  let gameWidth, gameHeight;

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

  let onloadScale;

  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", buttonHandler);
  });

  function buttonHandler(e) {
    e.target.blur();
    cancelAnimationFrame(animationId);
    checkWin(e.target.style.backgroundColor);
  }

  animationId = requestAnimationFrame(starting);

  resizeHandler();

  window.onresize = resizeHandler;

  function resizeHandler() {
    onloadScale = innerWidth / innerHeight;
    resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
  }
}
