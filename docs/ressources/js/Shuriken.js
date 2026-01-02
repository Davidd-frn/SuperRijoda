class Shuriken extends Entity {
  constructor(x, y, dir) {
    super(x, y, 24, 24); 
    this.dir = dir;      
    this.speed = 8;      
    this.life = 1.5;     
    this.angle = 0;      
    
    this.image = new Image();
    this.image.src = ASSETS.shuriken;
  }

  update(dt, L) {
    // 1. Movement and Life Span
    this.x += this.speed * this.dir;
    this.life -= dt;
    this.angle += 15 * dt; // Fast rotation

    // 2. Collision with Enemies
    // Check list of enemies in the level
    for (const e of L.enemies) {
      if (!e.dead && AABB(this.rect(), e.rect())) {
        e.dead = true;          // Kill the enemy
        this.life = 0;          // Destroy the shuriken
        playSFX(ASSETS.sfx_hit);
        spawnExplosion(e.x + e.w/2, e.y + e.h/2, "#b84328", 10);
        Game.score += 50;
        Game.resetHUD();
        break; // One shuriken hits only one enemy
      }
    }

    // 3. Collision with Platforms
    for (const p of L.platforms) {
       // Ignore one-way platforms
       if (!p.oneWay && AABB(this.rect(), p)) {
           this.life = 0; // Shuriken is destroyed on impact
           spawnExplosion(this.x, this.y, "#cccccc", 3);
           break;
       }
    }
  }

  draw() {
    const screenX = this.x - Game.camX + this.w / 2;
    const screenY = this.y + this.h / 2;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.angle); // Rotation effect
    
    // If image is loaded, draw it; otherwise, draw a placeholder
    if (this.image.complete && this.image.naturalHeight !== 0) {
       ctx.drawImage(this.image, -this.w/2, -this.h/2, this.w, this.h);
    } else {
       ctx.fillStyle = '#888';
       ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
    }
    
    ctx.restore();
  }
}