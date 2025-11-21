class Particle {
  constructor(x, y, color, speed) {
    this.x = x;
    this.y = y;
    this.w = Math.random() * 5 + 3; // Taille entre 3 et 8 px
    this.h = this.w;
    this.color = color;
    
    // Direction aléatoire (explosion)
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * speed;
    this.dx = Math.cos(angle) * velocity;
    this.dy = Math.sin(angle) * velocity;
    
    this.life = 1.0; // Vie de 100% à 0%
    this.decay = Math.random() * 0.03 + 0.01; // Vitesse de disparition
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life -= this.decay; // On réduit la vie
  }

  draw() {
    ctx.globalAlpha = this.life; // Transparence basée sur la vie
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - Game.camX, this.y, this.w, this.h);
    ctx.globalAlpha = 1.0; // Reset transparence pour le reste du jeu
  }
}