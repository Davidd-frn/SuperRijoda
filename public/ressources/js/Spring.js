class Spring extends Entity {
  constructor(x, y) {
    super(x, y, 48, 32); // Un peu plus petit qu'une plateforme
    this.power = -22;    // Force du saut (très haut !)
    this.active = false; // État pour l'animation
    this.timer = 0;
  }

  update(dt) {
    // Animation : le ressort reste "écrasé" ou "étendu" un court instant
    if (this.active) {
      this.timer -= dt;
      if (this.timer <= 0) this.active = false;
    }

    // Collision avec le joueur
    if (AABB(this.rect(), player.rect())) {
      // Le joueur doit arriver par le HAUT (dy > 0)
      // Et ses pieds doivent être au-dessus du bas du ressort
      const falling = player.dy > 0;
      const feetAbove = (player.y + player.h) < (this.y + this.h + 10);

      if (falling && feetAbove) {
        player.dy = this.power; // BOING !
        player.onGround = false;
        this.active = true;     // Active l'animation
        this.timer = 0.2;
        // playSFX(ASSETS.sfx_jump); // Optionnel : son de saut
      }
    }
  }

  draw() {
    const screenX = this.x - Game.camX;
    
    // Couleur : Violet (actif) ou Violet foncé (inactif)
    ctx.fillStyle = this.active ? "#DDA0DD" : "#8A2BE2";
    
    // Si actif, on le dessine un peu plus grand vers le haut
    const yOffset = this.active ? -10 : 0;
    const hOffset = this.active ? 10 : 0;

    ctx.fillRect(screenX, this.y + yOffset, this.w, this.h + hOffset);
    
    // Petite décoration (Flèche)
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText("⬆", screenX + 12, this.y + 24 + yOffset);
  }
}