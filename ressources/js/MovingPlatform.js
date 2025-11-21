class MovingPlatform extends Entity {
  constructor(x, y, w, h, rangeX, rangeY, speed) {
    super(x, y, w, h);
    this.baseX = x;
    this.baseY = y;
    this.rangeX = rangeX; // Distance de mouvement Horizontal
    this.rangeY = rangeY; // Distance de mouvement Vertical
    this.speed = speed;   // Vitesse
    this.timer = 0;
    
    // Pour que le joueur sache de combien on a bougé ce tour-ci
    this.dx = 0;
    this.dy = 0;
  }

  update(dt) {
    this.timer += dt * this.speed;

    const prevX = this.x;
    const prevY = this.y;

    // Mouvement sinusoïdal (Aller-retour fluide)
    // Math.sin donne une valeur entre -1 et 1
    this.x = this.baseX + Math.sin(this.timer) * this.rangeX;
    this.y = this.baseY + Math.sin(this.timer) * this.rangeY;

    // Calcul du déplacement réel pour déplacer le joueur avec nous
    this.dx = this.x - prevX;
    this.dy = this.y - prevY;
  }

  draw() {
    const screenX = this.x - Game.camX;
    
    // Dessin Violet (comme le mockup)
    ctx.fillStyle = "#9370DB"; // MediumPurple
    ctx.fillRect(screenX, this.y, this.w, this.h);
    
    // Bordure pour le style
    ctx.strokeStyle = "#4B0082"; // Indigo
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, this.y, this.w, this.h);

    // La flèche (Dessin simple)
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("↕", screenX + this.w/2 - 6, this.y + 20);
  }
}