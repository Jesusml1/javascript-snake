const CLOCK_TICK_TIME = 100;
const CANVAS_SIZE = 500;
const CELL_SIZE = 20;
const CELL_COUNT = 25;
const SOUND_VOLUME = 0.75;

const CANVAS_BACKGROUND_COLOR = "#ecfccb";
const FOOD_BACKGROUND_COLOR = "#dc2626";
const SNAKE_BACKGROUND_COLOR = "#365314";

const DIRECTION = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

function getRandomInteger(min, max) {
  let randomNumber = Math.random();
  randomNumber = randomNumber * (max - min);
  const result = Math.floor(randomNumber) + min;
  return result;
}

function Food() {
  this.x_pos = getRandomInteger(0, CELL_COUNT);
  this.y_pos = getRandomInteger(0, CELL_COUNT);

  this.draw = function (ctx) {
    ctx.fillStyle = FOOD_BACKGROUND_COLOR;
    ctx.fillRect(
      this.x_pos * CELL_SIZE,
      this.y_pos * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  };

  this.positionInSnake = function (position, snakeBody) {
    for (snakePart of snakeBody) {
      if (
        snakePart.x_pos === position.x_pos &&
        snakePart.y_pos === position.y_pos
      ) {
        return true;
      }
    }
    return false;
  };

  this.respawn = function (snakeBody) {
    let newPos = {
      x_pos: getRandomInteger(0, CELL_COUNT),
      y_pos: getRandomInteger(0, CELL_COUNT),
    };
    while (this.positionInSnake(newPos, snakeBody)) {
      newPos = {
        x_pos: getRandomInteger(0, CELL_COUNT),
        y_pos: getRandomInteger(0, CELL_COUNT),
      };
    }
    this.x_pos = newPos.x_pos;
    this.y_pos = newPos.y_pos;
  };

  this.checkIfSnakeTouchFood = function (snake) {
    const snakeHead = { ...snake.body[snake.body.length - 1] };
    if (this.x_pos === snakeHead.x_pos && this.y_pos === snakeHead.y_pos) {
      this.respawn(snake.body);
      snake.addPart = true;
      return true;
    }
    return false;
  };
}

function Snake() {
  this.getInitBody = function () {
    return [
      { x_pos: 1, y_pos: 10 },
      { x_pos: 2, y_pos: 10 },
      { x_pos: 3, y_pos: 10 },
    ];
  };

  this.body = [
    { x_pos: 1, y_pos: 10 },
    { x_pos: 2, y_pos: 10 },
    { x_pos: 3, y_pos: 10 },
  ];

  this.direction = DIRECTION.RIGHT;
  this.addPart = false;

  this.draw = function (ctx) {
    for (part of this.body) {
      ctx.fillStyle = SNAKE_BACKGROUND_COLOR;
      ctx.fillRect(
        part.x_pos * CELL_SIZE,
        part.y_pos * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  };

  this.setDirection = function (direction) {
    this.direction = direction;
  };

  this.update = function () {
    const newHead = { ...this.body[this.body.length - 1] };

    if (this.direction === DIRECTION.RIGHT) newHead.x_pos += 1;
    if (this.direction === DIRECTION.LEFT) newHead.x_pos -= 1;
    if (this.direction === DIRECTION.UP) newHead.y_pos -= 1;
    if (this.direction === DIRECTION.DOWN) newHead.y_pos += 1;

    if (this.addPart) {
      this.addPart = false;
    } else {
      this.body.shift();
    }
    this.body.push(newHead);
  };

  this.reset = function () {
    this.body = this.getInitBody();
    this.direction = DIRECTION.RIGHT;
  };

  this.checkForWallCollision = function () {
    const head = this.body[this.body.length - 1];
    if (head.x_pos < 0 || head.x_pos >= CELL_COUNT) {
      return true;
    }
    if (head.y_pos < 0 || head.y_pos >= CELL_COUNT) {
      return true;
    }
    return false;
  };

  this.checkForTailCollision = function () {
    const head = this.body[this.body.length - 1];
    const restOfBody = this.body.slice(0, this.body.length - 1);
    for (part of restOfBody) {
      if (part.x_pos === head.x_pos && part.y_pos === head.y_pos) {
        return true;
      }
    }
    return false;
  };
}

function Game() {
  this.gameOver = false;
  this.snake = new Snake();
  this.food = new Food();
  this.score = 0;
  this.scoreSound = new Audio("./sounds/score_up.mp3");
  this.scoreSound.volume = SOUND_VOLUME;
  this.gameOverSound = new Audio("./sounds/game_over.mp3");
  this.gameOverSound.volume = SOUND_VOLUME;

  this.canvas = document.getElementById("canvas");
  this.canvas.setAttribute("width", CANVAS_SIZE);
  this.canvas.setAttribute("height", CANVAS_SIZE);
  this.canvas.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
  this.ctx = this.canvas.getContext("2d");

  this.scoreSpan = document.getElementById("score");
  this.maxScoreSpan = document.getElementById("max-score");

  this.clearCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.init = function () {
    this.snake.draw(this.ctx);
    const currentMaxScore = localStorage.getItem("SNAKE_MAX_SCORE");
    if (currentMaxScore) {
      this.maxScoreSpan.innerText = currentMaxScore;
    }
  };

  this.update = function () {
    this.clearCanvas();
    this.food.draw(this.ctx);
    this.snake.update();
    this.snake.draw(this.ctx);
    if (this.food.checkIfSnakeTouchFood(this.snake)) {
      this.score += 1;
      this.scoreSpan.innerText = this.score;
      this.scoreSound.play();
    }
    if (
      this.snake.checkForWallCollision() ||
      this.snake.checkForTailCollision()
    ) {
      this.gameOver = true;
      this.gameOverSound.play();
    }
  };

  this.reset = function () {
    alert("Game over");
    this.updateMaxScore();
    this.snake.reset();
    this.gameOver = false;
    this.score = 0;
    this.scoreSpan.innerText = this.score;
  };

  this.updateMaxScore = function () {
    const currentMaxScore = localStorage.getItem("SNAKE_MAX_SCORE");
    if (!currentMaxScore) {
      localStorage.setItem("SNAKE_MAX_SCORE", this.score);
    } else {
      if (this.score > Number(currentMaxScore)) {
        localStorage.setItem("SNAKE_MAX_SCORE", this.score);
        this.maxScoreSpan.innerText = this.score;
      }
    }
  };
}

const game = new Game();

window.addEventListener("DOMContentLoaded", function () {
  game.init();

  setInterval(() => {
    game.update();
    if (game.gameOver) {
      game.reset();
    }
  }, CLOCK_TICK_TIME);
});

window.addEventListener("keypress", function (e) {
  if (e.key === "w" && game.snake.direction !== DIRECTION.DOWN) {
    game.snake.setDirection(DIRECTION.UP);
  }
  if (e.key === "d" && game.snake.direction !== DIRECTION.LEFT) {
    game.snake.setDirection(DIRECTION.RIGHT);
  }
  if (e.key === "s" && game.snake.direction !== DIRECTION.UP) {
    game.snake.setDirection(DIRECTION.DOWN);
  }
  if (e.key === "a" && game.snake.direction !== DIRECTION.RIGHT) {
    game.snake.setDirection(DIRECTION.LEFT);
  }
});
