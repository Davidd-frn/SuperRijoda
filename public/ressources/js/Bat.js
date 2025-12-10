class Bat extends Entity {
  constructor(x, y, dist = 100) {
    super(x, y, 48, 48); // Taille de la hitbox
    this.sheet = new Sheet(ASSETS.bat, SHEETS.bat);
    
    this.startX = x;      // Centre de sa zone de patrouille
    this.baseY = y;       // Hauteur de base
    this.dist = dist;     // Distance de vol (gauche/droite)
    this.timer = 0;       // Pour le mouvement fluide
    this.dead = false;
    
    // Direction pour l'affichage (1 ou -1)
    this.facing = 1; 
  }

  update(dt, L) {
    if (this.dead) return;

    this.timer += dt;

    // --- MOUVEMENT DE VOL ---
    // 1. Mouvement Horizontal (Aller-retour fluide avec Sinus)
    // On utilise Math.sin pour faire un mouvement doux de gauche à droite
    const offsetX = Math.sin(this.timer * 2) * this.dist;
    
    // Détection de la direction pour retourner l'image
    // Si la nouvelle position est à droite de l'ancienne, on regarde à droite
    const newX = this.startX + offsetX;
    if (newX > this.x) this.facing = 1; // Ajustez selon le sens de votre sprite
    else this.facing = -1;
    
    this.x = newX;

    // 2. Mouvement Vertical (Petit flottement haut/bas)
    // Ajoute un effet de vol réaliste
    this.y = this.baseY + Math.sin(this.timer * 5) * 15;

    // --- COLLISIONS AVEC LE JOUEUR ---
    if (AABB(this.rect(), player.rect())) {
        // Logique de dégâts identique à l'ennemi normal
        const fromTop = player.dy > 0 && player.y + player.h - this.y < 24;

        if (fromTop) {
            this.dead = true;
            player.dy = -8; // Rebond
            playSFX(ASSETS.sfx_hit);
            Game.score += 100; // Plus de points pour une chauve-souris !
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
    
    // Gestion du miroir (flip)
    ctx.save();
    ctx.translate(screenX + this.w / 2, this.y + this.h / 2);
    ctx.scale(this.facing, 1); 
    this.sheet.draw(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}