class MovingPlatform extends Entity {
  constructor(x, y, w, h, rangeX, rangeY, speed) {
    super(x, y, w, h);
    this.baseX = x;
    this.baseY = y;
    this.rangeX = rangeX; // Distance of movement Horizontal
    this.rangeY = rangeY; // Distance of movement Vertical
    this.speed = speed; // Speed
    this.timer = 0;

    // For player movement
    this.dx = 0;
    this.dy = 0;
  }

  update(dt) {
    this.timer += dt * this.speed;

    const prevX = this.x;
    const prevY = this.y;

    // Sinusoidal movement (smooth back-and-forth)
    this.x = this.baseX + Math.sin(this.timer) * this.rangeX;
    this.y = this.baseY + Math.sin(this.timer) * this.rangeY;

    // Calculate actual displacement to move the player with us
    this.dx = this.x - prevX;
    this.dy = this.y - prevY;
  }

  draw() {
    const screenX = this.x - Game.camX;

    if (cloudPlatformImg.complete && cloudPlatformImg.naturalWidth) {
      ctx.drawImage(cloudPlatformImg, screenX, this.y, this.w, this.h);
    } else {
      // Fallback rectangle if image not loaded
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX, this.y, this.w, this.h);

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, this.y, this.w, this.h);
    }
  }
}
