class Spring extends Entity {
  constructor(x, y) {
    super(x, y, 48, 32); // Slightly smaller than a platform
    this.power = -22;    // Jump power
    this.active = false; // State of the spring
    this.timer = 0;
  }

  update(dt) {
    // Animation : the spring remains ‘compressed’ or ‘extended’ for a short time
    if (this.active) {
      this.timer -= dt;
      if (this.timer <= 0) this.active = false;
    }

    // Collide with player
    if (AABB(this.rect(), player.rect())) {
      // The player must arrive from ABOVE (dy > 0)
      // And his feet must be above the bottom of the spring.
      const falling = player.dy > 0;
      const feetAbove = (player.y + player.h) < (this.y + this.h + 10);

      if (falling && feetAbove) {
        player.dy = this.power; 
        player.onGround = false;
        this.active = true;     // Activate the animation
        this.timer = 0.2;
        playSFX(ASSETS.sfx_jump); 
      }
    }
  }

  draw() {
    const screenX = this.x - Game.camX;
    
    // Colour: Purple (active) or Dark purple (inactive)
    ctx.fillStyle = this.active ? "#DDA0DD" : "#8A2BE2";
    
    // If active, the spring is ‘extended’
    const yOffset = this.active ? -10 : 0;
    const hOffset = this.active ? 10 : 0;

    ctx.fillRect(screenX, this.y + yOffset, this.w, this.h + hOffset);
    
    // Small arrow to indicate it’s a spring
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText("⬆", screenX + 12, this.y + 24 + yOffset);
  }
}