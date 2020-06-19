// Music
let globalVolumeBG = 0.5;
let globalVolumeSFX = 1;

let menuMusic = document.createElement("audio");
menuMusic.src = "./audio/menu.mp3";

menuMusic.loop = true;
menuMusic.volume = globalVolumeBG;

let gameMusic = document.createElement("audio");
gameMusic.src = "./audio/game.mp3";

gameMusic.loop = true;
gameMusic.volume = globalVolumeBG;

// Sounds
let hitSound = document.createElement("audio");
hitSound.src = "./audio/hit.mp3";
hitSound.volume = globalVolumeSFX;

let clickSound = document.createElement("audio");
clickSound.src = "./audio/click.mp3";
clickSound.volume = globalVolumeSFX;

// Options menu
const $volumeBGLabel = document.querySelector("#option-volume-bg > .label");
const $volumeBGMinusButton = document.querySelector(
  "#option-volume-bg > .minus-btn"
);
const $volumeBGPlusButton = document.querySelector(
  "#option-volume-bg > .plus-btn"
);

$volumeBGMinusButton.addEventListener("click", () => {
  if (globalVolumeBG >= 0.1) {
    globalVolumeBG -= 0.1;

    $volumeBGLabel.innerText = Math.round(globalVolumeBG * 100);

    menuMusic.volume = globalVolumeBG;
    gameMusic.volume = globalVolumeBG;
  }
});

$volumeBGPlusButton.addEventListener("click", () => {
  if (globalVolumeBG <= 0.9) {
    globalVolumeBG += 0.1;

    $volumeBGLabel.innerText = Math.round(globalVolumeBG * 100);

    menuMusic.volume = globalVolumeBG;
    gameMusic.volume = globalVolumeBG;
  }
});

const $volumeSFXLabel = document.querySelector("#option-volume-sfx > .label");
const $volumeSFXMinusButton = document.querySelector(
  "#option-volume-sfx > .minus-btn"
);
const $volumeSFXPlusButton = document.querySelector(
  "#option-volume-sfx > .plus-btn"
);

$volumeSFXMinusButton.addEventListener("click", () => {
  if (globalVolumeSFX >= 0.1) {
    globalVolumeSFX -= 0.1;

    $volumeSFXLabel.innerText = Math.round(globalVolumeSFX * 100);

    clickSound.volume = globalVolumeSFX;
    hitSound.volume = globalVolumeSFX;
  }
});

$volumeSFXPlusButton.addEventListener("click", () => {
  if (globalVolumeSFX <= 0.9) {
    globalVolumeSFX += 0.1;

    $volumeSFXLabel.innerText = Math.round(globalVolumeSFX * 100);

    clickSound.volume = globalVolumeSFX;
    hitSound.volume = globalVolumeSFX;
  }
});

// Key state
let keyState = [];

window.addEventListener("keydown", e => (keyState[e.key] = true));
window.addEventListener("keyup", e => (keyState[e.key] = false));

// Game loop
var gameLoop;

// States
const States = {
  mainMenu: {
    el: document.getElementById("main-menu"),
    start: () => {
      keyState = [];

      document.getElementById("gm-paused").classList.toggle("active", false);

      const bricksContainer = document.getElementById("gm-bricks");

      while (bricksContainer.hasChildNodes()) {
        bricksContainer.removeChild(bricksContainer.firstChild);
      }

      clearInterval(gameLoop);

      let leaderboard = [];

      const $leaderboardLabel = document.getElementById("leaderboard");

      $leaderboardLabel.innerText = "";

      axios
        .post("/getScore", {
          limit: 10
        })
        .then(res => {
          leaderboard = res.data.scoreList;

          for (let i = 0; i < leaderboard.length; i++) {
            $leaderboardLabel.innerText += ` [#${i + 1} ${
              leaderboard[i].name
            }: ${leaderboard[i].score}]`;
          }
        });
    },
    music: menuMusic
  },
  options: {
    el: document.getElementById("options"),
    start: () => {
      window.addEventListener("keydown", e => {
        if (currentState === "options" && e.key === "Escape") {
          changeState("mainMenu");
        }
      });
    },
    music: menuMusic
  },
  game: {
    el: document.getElementById("game"),
    start: () => {
      startGame();

      let paused = false;

      window.addEventListener("keydown", e => {
        if (currentState === "game" && e.key === "Enter") {
          paused = !paused;
          document
            .getElementById("gm-paused")
            .classList.toggle("active", paused);

          if (paused) States.game.music.pause();
          else States.game.music.play();
        }
      });

      gameLoop = setInterval(() => {
        if (paused) {
          if (keyState.Escape) {
            changeState("mainMenu");
          }
        } else {
          player.update();
          ball.update();
        }
      }, 1000 / 60);
    },
    music: gameMusic
  }
};

// State
let currentState;

const changeState = newState => {
  if (currentState) {
    if (States[currentState].music !== States[newState].music) {
      States[currentState].music.pause();
      States[currentState].music.currentTime = 0;
    }
  }
  States[newState].music.play();

  currentState = newState;

  for (let state in States) {
    States[state].el.classList.toggle("active", state === currentState);
  }

  States[currentState].start();
};

// Buttons
const buttons = document.querySelectorAll(".button");

for (let i = 0; i < buttons.length; i++) {
  if (buttons[i].hasAttribute("to")) {
    buttons[i].addEventListener("click", () => {
      setTimeout(() => changeState(buttons[i].getAttribute("to")), 400);

      clickSound.pause();
      clickSound.currentTime = 0;
      clickSound.play();
    });
  }
}

// Player
Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};

let player = {
  element: document.getElementById("gm-player"),
  x: 0,
  y: 500,
  width: 120,
  height: 6,
  speed: 10,
  lives: 3,
  score: 0,
  level: 1,
  move: variation => {
    player.x += variation;
    player.x = player.x.clamp(0, 800 - player.width);
    player.element.style.left = player.x + "px";
    player.element.style.top = player.y + "px";
  },
  setPosition: x => {
    player.x = x;
    player.element.style.left = player.x + "px";
    player.element.style.top = player.y + "px";
  },
  update: () => {
    let axis = 0;

    if (keyState.ArrowLeft) axis--;
    if (keyState.ArrowRight) axis++;

    if (axis !== 0) player.move(axis * player.speed);
  },
  addScore: score => {
    player.score += score;
    document.getElementById("gm-scoreval").innerText = player.score;
  },
  addLives: lives => {
    player.lives += lives;

    if (player.lives > 0) {
      document.getElementById("gm-livesval").innerText = player.lives;
    } else {
      changeState("mainMenu");

      let playerName = prompt(
        `¡Felicidades! Has conseguido ${
          player.score
        } puntos.\nPor favor, ingresa tu nombre.`
      );

      if (playerName.length > 0)
        axios
        .post("/addScore", {
          name: playerName,
          score: player.score
        })
        .then(response => console.log(response))
        .catch(e => console.log(e));
    }
  }
};

let ball = {
  element: document.getElementById("gm-ball"),
  x: 0,
  y: 0,
  size: 8,
  speed: 8,
  velocity: 0.8,
  dirx: -0.8,
  diry: -0.8,
  stop: true,
  nextLevel: false,
  setPosition: (x, y) => {
    ball.x = x;
    ball.y = y;
    ball.element.style.left = ball.x + "px";
    ball.element.style.top = ball.y + "px";
  },
  update: () => {
    if (ball.stop || ball.nextLevel) {
      if (!ball.nextLevel) {
        if (keyState.ArrowRight) {
          ball.stop = false;
          ball.dirx = ball.velocity;
        } else if (keyState.ArrowLeft) {
          ball.stop = false;
          ball.dirx = -ball.velocity;
        }
      }
    } else {
      const bricksContainer = document.getElementById("gm-bricks");
      const bricks = document.querySelectorAll("#gm-bricks .gm-brick");
      const bWidth = 80;
      const bHeight = 30;

      if (bricks.length < 1) {
        ball.nextLevel = true;

        const $nextLevel = document.getElementById("gm-nextlevel");
        const $nextLevelValue = document.getElementById("gm-nextlevelval");

        $nextLevel.classList.toggle("active", true);
        $nextLevelValue.innerText = player.level + 1;

        setTimeout(() => {
          $nextLevel.classList.toggle("active", false);

          setupLevel();
          setupBall();

          player.level++;
          player.addLives(1);

          ball.velocity += 0.1;

          ball.nextLevel = false;
        }, 1000);
      }

      for (let i = 0; i < ball.speed; i++) {
        // Border map collision
        if (ball.x < 0 || ball.x + ball.size >= 800 - ball.size)
          ball.dirx *= -1;
        if (ball.y < 0 || ball.y + ball.size >= 600 - ball.size)
          ball.diry *= -1;

        // Paddle collision
        if (ball.y + ball.size > player.y && ball.y < player.y) {
          if (
            ball.x + ball.size > player.x &&
            ball.x < player.x + player.width
          ) {
            ball.diry = -ball.velocity;

            // Horizontal variance
            let horizontal =
              (ball.x + ball.size / 2 - (player.x + player.width / 2)) /
              (player.width / 2);

            // Clamps the value
            if (horizontal > -0.2 && horizontal < 0.2) {
              if (horizontal < 0) horizontal = -0.2;
              else horizontal = 0.2;
            }

            ball.dirx = horizontal * ball.velocity;
          }
        }

        if (ball.y > player.y + 80) {
          setupBall();
          player.addLives(-1);
        }

        // Brick collision
        for (let i = 0; i < bricks.length; i++) {
          const brick = {
            x: parseInt(bricks[i].style.left, 10),
            y: parseInt(bricks[i].style.top, 10),
            middleX: parseInt(bricks[i].style.left, 10) + bWidth / 2,
            middleY: parseInt(bricks[i].style.top, 10) + bHeight / 2
          };
          if (ball.y + ball.size > brick.y && ball.y < brick.y + bHeight) {
            if (ball.x + ball.size > brick.x && ball.x < brick.x + bWidth) {
              hitSound.pause();
              hitSound.currentTime = 0;
              hitSound.play();

              // Horizontal-Vertical collision detection
              const horizontal = Math.abs(
                (ball.x + ball.size / 2 - brick.middleX) / (bWidth / 2)
              );
              const vertical = Math.abs(
                (ball.y + ball.size / 2 - brick.middleY) / (bHeight / 2)
              );

              if (Math.round(horizontal * 10) > Math.round(vertical * 10)) {
                ball.dirx *= -1;
              } else {
                ball.diry *= -1;
              }

              player.addScore(50);

              const brickLevel = bricks[i].getAttribute("level");

              if (brickLevel <= 1) {
                bricksContainer.removeChild(bricks[i]);
              } else {
                bricks[i].setAttribute("level", brickLevel - 1);
              }
            }
          }
        }

        ball.x += ball.dirx;
        ball.y += ball.diry;
      }

      ball.element.style.left = ball.x + "px";
      ball.element.style.top = ball.y + "px";
    }
  }
};

const setupLevel = () => {
  const fromHeight = 60;
  const bricksContainer = document.getElementById("gm-bricks");

  let rows = player.level + 2;
  if (rows > 5) rows = 5;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < 10; j++) {
      const brickElement = document.createElement("div");

      brickElement.className = "gm-brick";
      brickElement.style.left = j * 80 + "px";
      brickElement.style.top = fromHeight + i * 30 + "px";
      brickElement.setAttribute("level", rows - i);

      bricksContainer.appendChild(brickElement);
    }
  }
};

const setupBall = () => {
  ball.setPosition(player.x + player.width / 2 - ball.size / 2, player.y - 10);
  ball.stop = true;
  ball.diry = -ball.velocity;
};

const startGame = () => {
  player.setPosition(800 / 2 - player.width / 2);
  setupBall();

  setupLevel();

  player.lives = 3;
  player.score = 0;
  player.level = 1;

  player.addLives(0);
  player.addScore(0);
};

window.addEventListener("load", () => {
  changeState("mainMenu");
});