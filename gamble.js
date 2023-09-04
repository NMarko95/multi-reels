export function gamble(gambleAmount, space, bank, bankSpan, history) {
  const main = document.querySelector(".main");
  const mainContainer = document.querySelector(".main-container");
  const mainCanvas = document.querySelector(".gamble-canvas");
  const historyCanvas = document.querySelector(".history-canvas");

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

  let amount = gambleAmount;
  let amountWin = amount * 2;
  let attempts = 5;

  const text = document.querySelector(".display-text");
  text.innerHTML = "";
  const btns = document.querySelectorAll(".btn");

  const attemptsValue = document.querySelector(".attempts-value");
  attemptsValue.innerHTML = attempts;
  const gambleWinValue = document.querySelector(".gamble-win-value");
  gambleWinValue.innerHTML = amountWin;
  const gambleAmountValue = document.querySelector(".gamble-amount-value");
  gambleAmountValue.innerHTML = amount;

  disableSwitch(false);

  const takeWinBtn = document.getElementsByClassName("take-win-btn")[0];
  takeWinBtn.disabled = true;
  takeWinBtn.addEventListener("click", takeWinHandler);

  function takeWinHandler(e) {
    takeWin();
    e.target.blur();
  }

  let btn = document.querySelector(".btn.red");
  btn.style.backgroundColor = red;

  btn = document.querySelector(".btn.black");
  btn.style.backgroundColor = black;

  let imgBlack = new Image();
  imgBlack.src = "black.png";

  let imgRed = new Image();
  imgRed.src = "red.png";

  let currentImg;

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

  onloadScale = innerWidth / innerHeight;
  resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);

  window.onresize = resizeHandler;

  function resizeHandler() {
    onloadScale = innerWidth / innerHeight;
    resize(innerWidth, innerHeight, ASPECT_RATIO_MAIN);
  }
}
