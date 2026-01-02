class Particle {
  constructor(x, y, color, speed) {
    this.x = x;
    this.y = y;
    this.w = Math.random() * 5 + 3; // Size between 3 and 8
    this.h = this.w;
    this.color = color;
    
    // Random direction and speed
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * speed;
    this.dx = Math.cos(angle) * velocity;
    this.dy = Math.sin(angle) * velocity;
    
    this.life = 1.0; // Life starts at 1.0
    this.decay = Math.random() * 0.03 + 0.01; // Speed of decay
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life -= this.decay; // Reduce life
  }

  draw() {
    ctx.globalAlpha = this.life; // Transparence based on life
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - Game.camX, this.y, this.w, this.h);
    ctx.globalAlpha = 1.0; // Reset transparence 
  }
}