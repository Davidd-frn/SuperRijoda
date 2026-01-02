class Spike extends Entity {
  constructor(x, y) {
    // 64x32 pixels is the size of the spike
    super(x, y, 64, 32);
    this.image = ASSETS.spike || null; 
  }

  update(dt) {
    // If the player collides with the spike
    if (AABB(this.rect(), player.rect())) {
      // Verify if the player is not invulnerable
      if (player.invul <= 0) {
        Game.lives--;
        player.invul = 60; // Invulnerability frames
        player.dy = -8;    // Small backward jump (recoil)
        playSFX(ASSETS.sfx_damage);

        // If no more lives, Game Over
        if (Game.lives <= 0) end(false);
      }
    }
  }

  draw() {
    const screenX = this.x - Game.camX;

    if (this.image) {
      ctx.drawImage(this.image, screenX, this.y, this.w, this.h);
    } else {
      // Temporary spike drawing
      ctx.fillStyle = "#888"; 
      ctx.beginPath();
      // Draw 3 spikes
      const w3 = this.w / 3;
      for(let i=0; i<3; i++) {
        ctx.moveTo(screenX + i*w3, this.y + this.h);      
        ctx.lineTo(screenX + i*w3 + w3/2, this.y);        
        ctx.lineTo(screenX + (i+1)*w3, this.y + this.h);  
      }
      ctx.fill();
    }
  }
}