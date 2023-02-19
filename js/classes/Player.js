class Player extends Sprite {
  constructor({
    position,
    floorCollisionBlocks,
    platformCollisionBlocks,
    imgSrc,
    frameRate,
    frameBuffer,
    scale = 0.5,
    animations,
  }) {
    super({ imgSrc, frameRate, frameBuffer, scale });
    this.position = position;
    this.velocity = { x: 0, y: 1 };
    this.floorCollisionBlocks = floorCollisionBlocks;
    this.platformCollisionBlocks = platformCollisionBlocks;
    this.hitbox = {
      position: { x: this.position.x, y: this.position.y },
      width: 10,
      height: 10,
    };

    this.animations = animations;
    this.lastDirection = "right";
    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imgSrc;
      this.animations[key].image = image;
    }

    this.cameraBox = {
      position: { x: this.position.x, y: this.position.y },
      width: 200,
      height: 80,
    };
  }

  switchSprite(key) {
    if (this.image === this.animations[key].image || !this.loaded) return;

    this.currentFrame = 0;
    this.image = this.animations[key].image;
    this.frameRate = this.animations[key].frameRate;
    this.frameBuffer = this.animations[key].frameBuffer;
  }

  update() {
    this.updateFrame();
    this.updateHitbox();
    this.updateCameraBox();

    /**
     *! draw the camera box
     **/
    if (checkBoxes.isCameraboxEnabled) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
      ctx.fillRect(
        this.cameraBox.position.x,
        this.cameraBox.position.y,
        this.cameraBox.width,
        this.cameraBox.height
      );
    }

    /**
     *! draw the image container
     **/
    // ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    /**
     *! draw the hitbox
     **/
    if (checkBoxes.isHitboxEnabled) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      ctx.fillRect(
        this.hitbox.position.x,
        this.hitbox.position.y,
        this.hitbox.width,
        this.hitbox.height
      );
    }

    this.draw();

    this.position.x += this.velocity.x;

    this.updateHitbox();
    this.horizontalBoundary();
    this.verticalBoundary();

    this.applyGravity();

    this.updateHitbox();
    this.checkForVerticalCollision();
  }

  updateHitbox() {
    this.hitbox = {
      position: { x: this.position.x + 35, y: this.position.y + 26 },
      width: 14,
      height: 27,
    };
  }

  updateCameraBox() {
    this.cameraBox = {
      position: { x: this.position.x - 50, y: this.position.y },
      width: 200,
      height: 80,
    };
  }

  shouldPanCameraToTheLeft({ canvas, camera }) {
    const cameraBoxRightSide = this.cameraBox.position.x + this.cameraBox.width;
    const scaledCanvasWidth = canvas.width / 4;

    if (cameraBoxRightSide >= 575) return;

    if (cameraBoxRightSide >= scaledCanvasWidth + Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraToTheRight({ camera }) {
    if (this.cameraBox.position.x <= 4) return;

    if (this.cameraBox.position.x <= Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraToDown({ camera }) {
    if (this.cameraBox.position.y + this.velocity.y <= 0) return;

    if (this.cameraBox.position.y <= Math.abs(camera.position.y)) {
      camera.position.y -= this.velocity.y;
    }
  }

  shouldPanCameraToUp({ canvas, camera }) {
    const scaledCanvasHeight = canvas.height / 4;

    if (
      this.cameraBox.position.y + this.cameraBox.height + this.velocity.y >=
      432
    )
      return;

    if (
      this.cameraBox.position.y + this.cameraBox.height >=
      Math.abs(camera.position.y) + scaledCanvasHeight
    ) {
      camera.position.y -= this.velocity.y;
    }
  }

  verticalBoundary() {
    if (
      this.hitbox.position.y + this.hitbox.height + this.velocity.y >= 576 ||
      this.hitbox.position.y + this.velocity.y <= 4
    ) {
      this.velocity.y = 0;
    }
  }

  horizontalBoundary() {
    if (
      this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
      this.hitbox.position.x + this.velocity.x <= 4
    ) {
      this.velocity.x = 0;
    }
  }

  applyGravity() {
    this.velocity.y += gravity;
    this.position.y += this.velocity.y;
  }

  checkForVerticalCollision() {
    //Floor Collision Blocks
    for (let i = 0; i < this.floorCollisionBlocks.length; i++) {
      const collisionBlock = this.floorCollisionBlocks[i];

      if (
        floorCollision({
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offest =
            this.hitbox.position.y - this.position.y + this.hitbox.height;

          this.position.y = collisionBlock.position.y - offest - 0.01;
          break;
        }

        if (this.velocity.y < 0) {
          this.velocity.y = 0;

          const offest = this.hitbox.position.y - this.position.y;

          this.position.y =
            collisionBlock.position.y + collisionBlock.height - offest + 0.01;
          break;
        }
      }
    }

    //Platform Collision Blocks
    for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
      const collisionBlock = this.platformCollisionBlocks[i];

      if (
        platformCollision({
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offest =
            this.hitbox.position.y - this.position.y + this.hitbox.height;

          this.position.y = collisionBlock.position.y - offest - 0.01;
          break;
        }
      }
    }
  }
}
