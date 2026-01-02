class Shuriken extends Entity {
  constructor(x, y, dir) {
    super(x, y, 24, 24); 
    this.dir = dir;      
    this.speed = 8;      
    this.life = 1.5;     
    this.angle = 0;      
    
    // Si vous avez une image
    this.image = new Image();
    this.image.src = ASSETS.shuriken;
  }

  update(dt, L) {
    // 1. Mouvement
    this.x += this.speed * this.dir;
    this.life -= dt;
    this.angle += 15 * dt; // Rotation rapide

    // 2. Collision avec les Ennemis
    // On parcourt la liste des ennemis du niveau (L.enemies)
    for (const e of L.enemies) {
      if (!e.dead && AABB(this.rect(), e.rect())) {
        e.dead = true;          // Tuer l'ennemi
        this.life = 0;          // Détruire le shuriken
        playSFX(ASSETS.sfx_hit);
        spawnExplosion(e.x + e.w/2, e.y + e.h/2, "#b84328", 10);
        Game.score += 50;
        Game.resetHUD();
        break; // Un shuriken ne touche qu'un ennemi à la fois
      }
    }

    // 3. Collision avec les Murs 
    for (const p of L.platforms) {
       // On ignore les plateformes traversables 
       if (!p.oneWay && AABB(this.rect(), p)) {
           this.life = 0; // Le shuriken se plante dans le mur
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
    ctx.rotate(this.angle); // Effet de rotation
    
    // Si l'image existe, on la dessine, sinon un carré gris
    if (this.image.complete && this.image.naturalHeight !== 0) {
       ctx.drawImage(this.image, -this.w/2, -this.h/2, this.w, this.h);
    } else {
       ctx.fillStyle = '#888';
       ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
    }
    
    ctx.restore();
  }
}