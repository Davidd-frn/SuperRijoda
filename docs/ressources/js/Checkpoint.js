class Checkpoint extends Entity {
  constructor(x, y) {
    super(x, y, 40, 60); // Taille de la lanterne
    this.active = false; // Par défaut, éteinte
    this.timer = 0;
  }

  update(dt) {
    // Animation simple (flottement)
    this.timer += dt * 2;

    // Si le joueur touche la lanterne
    if (!this.active && AABB(this.rect(), player.rect())) {
      this.activate();
    }
  }

  activate() {
    this.active = true;
    
    // On dit au Niveau : "C'est le nouveau point de départ !"
    Level.setRespawn(this.x, this.y);
    
    // Petit effet sonore (on réutilise le son de pièce pour l'instant)
    playSFX(ASSETS.sfx_coin); 
  }

  draw() {
    const screenX = this.x - Game.camX;
    
    // 1. Le Poteau (Bois foncé)
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(screenX + 15, this.y + 20, 10, 40);

    // 2. La Lanterne (Change de couleur si active)
    if (this.active) {
        // ALLUMÉE : Rouge vif + Lueur jaune
        ctx.fillStyle = "#ff3d00"; 
        ctx.shadowBlur = 20;
        ctx.shadowColor = "gold";
    } else {
        // ÉTEINTE : Rouge sombre terne
        ctx.fillStyle = "#3e2723";
        ctx.shadowBlur = 0;
    }

    // Dessin de la lanterne (Rectangle arrondi)
    ctx.fillRect(screenX, this.y, 40, 30);
    
    // Détail jaune (le caractère chinois ou la lumière intérieure)
    ctx.fillStyle = this.active ? "#ffea00" : "#5d4037";
    ctx.fillRect(screenX + 10, this.y + 5, 20, 20);

    // Reset des effets d'ombre pour ne pas gâcher le reste du jeu
    ctx.shadowBlur = 0;
  }
}