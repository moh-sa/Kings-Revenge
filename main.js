const hitbox = document.getElementById("hitbox");
const camerabox = document.getElementById("camerabox");
const blocks = document.getElementById("blocks");

const checkBoxes = {
  isHitboxEnabled: false,
  isCameraboxEnabled: false,
  isBlocksEnabled: false,
};

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const scaledCanvas = {
  width: canvas.width / 4,
  height: canvas.height / 4,
};

const floorCollisions2D = [];
for (let i = 0; i < floorCollisions.length; i += 36) {
  floorCollisions2D.push(floorCollisions.slice(i, i + 36));
}

const floorCollisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 202)
      floorCollisionBlocks.push(
        new CollisionBlock({ position: { x: x * 16, y: y * 16 } })
      );
  });
});

const platformCollisions2D = [];
for (let i = 0; i < platformCollisions.length; i += 36) {
  platformCollisions2D.push(platformCollisions.slice(i, i + 36));
}

const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 202)
      platformCollisionBlocks.push(
        new CollisionBlock({ position: { x: x * 16, y: y * 16 }, height: 4 })
      );
  });
});

const gravity = 0.1;

const player = new Player({
  position: { x: 100, y: 300 },
  floorCollisionBlocks,
  platformCollisionBlocks,
  imgSrc: "./imgs/warrior/Idle.png",
  frameRate: 8,
  frameBuffer: 20,
  animations: {
    Idle: {
      imgSrc: "./imgs/warrior/Idle.png",
      frameRate: 8,
      frameBuffer: 20,
    },
    IdleLeft: {
      imgSrc: "./imgs/warrior/IdleLeft.png",
      frameRate: 8,
      frameBuffer: 20,
    },
    Run: {
      imgSrc: "./imgs/warrior/Run.png",
      frameRate: 8,
      frameBuffer: 20,
    },
    RunLeft: {
      imgSrc: "./imgs/warrior/RunLeft.png",
      frameRate: 8,
      frameBuffer: 20,
    },
    Jump: {
      imgSrc: "./imgs/warrior/Jump.png",
      frameRate: 2,
      frameBuffer: 3,
    },
    JumpLeft: {
      imgSrc: "./imgs/warrior/JumpLeft.png",
      frameRate: 2,
      frameBuffer: 3,
    },
    Fall: {
      imgSrc: "./imgs/warrior/Fall.png",
      frameRate: 2,
      frameBuffer: 3,
    },
    FallLeft: {
      imgSrc: "./imgs/warrior/FallLeft.png",
      frameRate: 2,
      frameBuffer: 3,
    },
  },
});

const keys = {
  d: {
    isPressed: false,
  },
  a: {
    isPressed: false,
  },
};

const background = new Sprite({
  position: { x: 0, y: 0 },
  imgSrc: "./imgs/background.png",
});

const backgroundHeight = 432;

const camera = {
  position: { x: 0, y: -backgroundHeight + scaledCanvas.height },
};

function animate() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(4, 4);
  ctx.translate(camera.position.x, camera.position.y);
  background.update();
  /**
   *! Draw the collision blocks
   */
  if (checkBoxes.isBlocksEnabled) {
    floorCollisionBlocks.forEach((block) => {
      block.update();
    });
    platformCollisionBlocks.forEach((block) => {
      block.update();
    });
  }
  player.horizontalBoundary();
  player.verticalBoundary();
  player.update();

  player.velocity.x = 0;
  if (keys.d.isPressed) {
    player.switchSprite("Run");
    player.velocity.x = 1.0;
    player.lastDirection = "right";
    player.shouldPanCameraToTheLeft({ canvas, camera });
  } else if (keys.a.isPressed) {
    player.switchSprite("RunLeft");
    player.velocity.x = -1.5;
    player.lastDirection = "left";
    player.shouldPanCameraToTheRight({ canvas, camera });
  } else if (player.velocity.y === 0) {
    if (player.lastDirection === "right") player.switchSprite("Idle");
    else player.switchSprite("IdleLeft");
  }
  if (player.velocity.y < 0) {
    player.shouldPanCameraToDown({ canvas, camera });
    if (player.lastDirection === "right") player.switchSprite("Jump");
    else player.switchSprite("JumpLeft");
  } else if (player.velocity.y > 0) {
    player.shouldPanCameraToUp({ canvas, camera });
    if (player.lastDirection === "right") player.switchSprite("Fall");
    else player.switchSprite("FallLeft");
  }

  ctx.restore();

  requestAnimationFrame(animate);
}

animate();

addEventListener("keydown", () => {
  switch (event.code) {
    case "KeyD":
    case "ArrowRight":
      keys.d.isPressed = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      keys.a.isPressed = true;
      break;
    case "KeyW":
    case "ArrowUp":
      player.velocity.y = -4;
      break;

    default:
      break;
  }
});

addEventListener("keyup", () => {
  switch (event.code) {
    case "KeyD":
    case "ArrowRight":
      keys.d.isPressed = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      keys.a.isPressed = false;
      break;

    default:
      break;
  }
});

addEventListener("change", () => {
  if (hitbox.checked) checkBoxes.isHitboxEnabled = true;
  else if (!hitbox.checked) checkBoxes.isHitboxEnabled = false;

  if (camerabox.checked) checkBoxes.isCameraboxEnabled = true;
  else if (!camerabox.checked) checkBoxes.isCameraboxEnabled = false;

  if (blocks.checked) checkBoxes.isBlocksEnabled = true;
  else if (!blocks.checked) checkBoxes.isBlocksEnabled = false;
});
