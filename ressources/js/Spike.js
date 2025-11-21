class Spike extends Entity {
  constructor(x, y) {
    // 64x32 correspond à la taille standard d'une rangée de piques
    super(x, y, 64, 32);
    // Vous pourrez ajouter une image plus tard dans config.js si vous voulez
    this.image = ASSETS.spike || null; 
  }

  update(dt) {
    // Si le joueur touche les piques
    if (AABB(this.rect(), player.rect())) {
      // On vérifie que le joueur n'est pas déjà clignotant (invulnérable)
      if (player.invul <= 0) {
        Game.lives--;
        player.invul = 60; // Rend invulnérable pendant ~1 seconde
        player.dy = -8;    // Petit bond en arrière (recul)
        playSFX(ASSETS.sfx_damage);
        
        // Si plus de vie, Game Over
        if (Game.lives <= 0) end(false);
      }
    }
  }

  draw() {
    const screenX = this.x - Game.camX;

    if (this.image) {
      ctx.drawImage(this.image, screenX, this.y, this.w, this.h);
    } else {
      // DESSIN TEMPORAIRE (Dents grises)
      ctx.fillStyle = "#888"; // Gris
      ctx.beginPath();
      // On dessine 3 petits triangles
      const w3 = this.w / 3;
      for(let i=0; i<3; i++) {
        ctx.moveTo(screenX + i*w3, this.y + this.h);      // Bas gauche
        ctx.lineTo(screenX + i*w3 + w3/2, this.y);        // Sommet
        ctx.lineTo(screenX + (i+1)*w3, this.y + this.h);  // Bas droite
      }
      ctx.fill();
    }
  }
}