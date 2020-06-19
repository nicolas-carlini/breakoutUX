window.addEventListener("load", () => {
  const $optionAnimatedBG = document.getElementById("option-animated-bg");

  let animatedBG = true;

  $optionAnimatedBG.addEventListener("click", () => {
    animatedBG = !animatedBG;

    $optionAnimatedBG.innerText = animatedBG ? "Sí" : "No";
  });

  const $starsBackground = document.getElementById("stars-bg");

  for (let i = 0; i < 50; i++) {
    const starElement = document.createElement("div");

    const size = Math.round(1 + Math.random() * 2);

    starElement.size = size;

    starElement.style.left = Math.random() * 100 + "%";
    starElement.style.top = Math.random() * 100 + "%";
    starElement.style.width = size + "px";
    starElement.style.height = size + "px";

    $starsBackground.appendChild(starElement);
  }

  setInterval(() => {
    if (animatedBG) {
      const stars = document.querySelectorAll("#stars-bg > div");

      for (let i = 0; i < stars.length; i++) {
        let y = parseFloat(stars[i].style.top, 10);

        y += stars[i].size * 0.05;

        if (y > 100) y = -10;

        stars[i].style.top = y + "%";
      }
    }
  }, 30);
});
