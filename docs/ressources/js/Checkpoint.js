class Checkpoint extends Entity {
  constructor(x, y) {
    super(x, y, 40, 60); // Size of the checkpoint
    this.active = false; // By default, the checkpoint is inactive
    this.timer = 0;
  }

  update(dt) {
    // Simple animation
    this.timer += dt * 2;

    // If the player touches the checkpoint and it's not active yet
    if (!this.active && AABB(this.rect(), player.rect())) {
      this.activate();
    }
  }

  activate() {
    this.active = true;
    
    // We toll the level to set the respawn point here
    Level.setRespawn(this.x, this.y);
    
    // Small sound effect to indicate activation
    playSFX(ASSETS.sfx_coin); 
  }

  draw() {
    const screenX = this.x - Game.camX;
    
    // 1. The Pole
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(screenX + 15, this.y + 20, 10, 40);

    // 2. The Lantern
    if (this.active) {
        // State ON : Red bright glowing
        ctx.fillStyle = "#ff3d00"; 
        ctx.shadowBlur = 20;
        ctx.shadowColor = "gold";
    } else {
        // State OFF : Dark brown
        ctx.fillStyle = "#3e2723";
        ctx.shadowBlur = 0;
    }

    // Lantern body
    ctx.fillRect(screenX, this.y, 40, 30);
    
    // Decorative light
    ctx.fillStyle = this.active ? "#ffea00" : "#5d4037";
    ctx.fillRect(screenX + 10, this.y + 5, 20, 20);

    // Reset shadow
    ctx.shadowBlur = 0;
  }
}