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
        if (i === 0 || i === 4) {
          while (randomSymbol === 0) randomSymbol = generateRandomNumber();
        }
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

function makeShadows() {
  context.globalAlpha = 0.5;
  context.fillRect(0, 0, cellWidth * tableDimX, cellHeight * tableDimY);
  context.globalAlpha = 1;
}

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
