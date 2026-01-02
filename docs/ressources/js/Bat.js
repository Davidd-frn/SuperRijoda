class Bat extends Entity {
  constructor(x, y, dist = 100) {
    super(x, y, 48, 48); // Size of the bat
    this.sheet = new Sheet(ASSETS.bat, SHEETS.bat);
    
    this.startX = x;      // Center the horizontal movement
    this.baseY = y;       // Height base for vertical movement
    this.dist = dist;     // Distance of horizontal movement
    this.timer = 0;       // For movement timing
    this.dead = false;
    
    // Direction the bat is facing: 1 for right, -1 for left
    this.facing = 1; 
  }

  update(dt, L) {
    if (this.dead) return;

    this.timer += dt;

    // --- MOVEMENT ---
    // 1. Horizontal Movement (Smooth back-and-forth with Sinus)
    // We use Math.sin to create a smooth left-to-right movement
    const offsetX = Math.sin(this.timer * 2) * this.dist;
    
    // Detection of direction change for sprite facing
    // If the new position is greater than the current, it's moving right
    const newX = this.startX + offsetX;
    if (newX > this.x) this.facing = 1; // Ajust the facing direction
    else this.facing = -1;
    
    this.x = newX;

    // 2. Vertical Movement
    // Add a vertical oscillation to simulate flying
    this.y = this.baseY + Math.sin(this.timer * 5) * 15;

    // --- Collisions with the player ---
    if (AABB(this.rect(), player.rect())) {
        // Logic to determine if the player hits the bat from above
        const fromTop = player.dy > 0 && player.y + player.h - this.y < 24;

        if (fromTop) {
            this.dead = true;
            player.dy = -8; // Rebounce the player upwards
            playSFX(ASSETS.sfx_hit);
            Game.score += 100; // More points for defeating an enemy
            Game.resetHUD();
        } else if (player.invul <= 0) {
            Game.lives--;
            player.invul = 60;
            Game.resetHUD();
            playSFX(ASSETS.sfx_damage);
            if (Game.lives <= 0) end(false);
        }
    }

    // Animation
    this.sheet.set('fly');
    this.sheet.step(dt);
  }

  draw() {
    if (this.dead) return;

    const screenX = this.x - Game.camX;
    
    // Mirror the sprite based on facing direction
    ctx.save();
    ctx.translate(screenX + this.w / 2, this.y + this.h / 2);
    ctx.scale(this.facing, 1); 
    this.sheet.draw(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}