export function showLoaderScreen() {
  const loader = document.querySelector(".loading__screen");
  loader?.classList.add("loading__screen--show");
}

export function hideLoaderScreen() {
  const loader = document.querySelector(".loading__screen");
  // setTimeout to avoid screen blinking
  setTimeout(() => {
    loader?.classList.remove("loading__screen--show");
  }, 500);
}
