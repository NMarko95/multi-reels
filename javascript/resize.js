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
