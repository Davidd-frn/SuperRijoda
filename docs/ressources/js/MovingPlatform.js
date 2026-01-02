class MovingPlatform extends Entity {
  constructor(x, y, w, h, rangeX, rangeY, speed) {
    super(x, y, w, h);
    this.baseX = x;
    this.baseY = y;
    this.rangeX = rangeX; // Distance de mouvement Horizontal
    this.rangeY = rangeY; // Distance de mouvement Vertical
    this.speed = speed; // Vitesse
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
    this.x = this.baseX + Math.sin(this.timer) * this.rangeX;
    this.y = this.baseY + Math.sin(this.timer) * this.rangeY;

    // Calcul du déplacement réel pour déplacer le joueur avec nous
    this.dx = this.x - prevX;
    this.dy = this.y - prevY;
  }

  draw() {
    const screenX = this.x - Game.camX;

    if (cloudPlatformImg.complete && cloudPlatformImg.naturalWidth) {
      ctx.drawImage(cloudPlatformImg, screenX, this.y, this.w, this.h);
    } else {
      // fallback si l'image ne charge pas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(screenX, this.y, this.w, this.h);

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, this.y, this.w, this.h);
    }
  }
}
