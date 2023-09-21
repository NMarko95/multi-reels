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
    if (i === 0 || i === 4) {
      while (currentImg === 0) currentImg = generateRandomNumber();
    }
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

function animateAllWinningSymbols() {
  if (currentTime - lastRender > spriteAnimateTime) {
    spriteAnimateCounter++;
    lastRender = Date.now();
  }
  if (spriteAnimateCounter >= 20) {
    spriteAnimateCounter = 0;
    winContext.clearRect(0, 0, winCanvas.width, winCanvas.height);
    cancelAnimationFrame(idAnimateAllSprites);
    currentTime = lastRender = Date.now();
    findCorrectSprite(winningLines[0][0].img.src);
    drawWinningLines(currentIndexWinning);
    drawLine(currentIndexWinning);
    animateWinningSymbols();
    return;
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
  currentTime = Date.now();
  idAnimateAllSprites = requestAnimationFrame(animateAllWinningSymbols);
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
