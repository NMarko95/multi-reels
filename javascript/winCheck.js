function checkWin() {
  isStopping = false;
  rearrangeBoard();
  //checkWild();
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
    setTimeout(() => (space.blocked = false), 1500);
  } else {
    setTimeout(() => (space.blocked = false), 200);
  }
}

function checkWild() {
  for (let i = 0; i < tableDimX; i++) {
    for (let j = 0; j < tableDimY; j++) {
      currentSymbol = newBoard[i][j];
      currentSplitSrc = currentSymbol.img.src.split(".png")[0];
      currentImgNumber = currentSplitSrc[currentSplitSrc.length - 1];
      if (currentImgNumber == "0") {
        animateWild(currentSymbol, j);
      }
    }
  }
}

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

function checkIfSubset() {
  isSubset = false;
  for (let i = 0; i < winningLines.length && !isSubset; i++) {
    isSubset = currentWinningLine.every((element) =>
      winningLines[i].includes(element)
    );
  }
  return isSubset;
}

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
