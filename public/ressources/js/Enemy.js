class Enemy extends Entity{
  constructor(x, y) {
    super(x, y, 64, 64);
    this.sheet = new Sheet(ASSETS.enemy, SHEETS.enemy);
    this.dir = Math.random() < 0.5 ? -1 : 1; // Commence vers la gauche ou droite
    this.speed = 1.4; // Vitesse de marche
    this.dead = false;
  }

  update(dt, L) {
    if (this.dead) return;

    // 1. Calculer la future position
    const nextX = this.x + (this.speed * this.dir);
    
    // 2. DÉTECTION DU VIDE (Cliff Detection)
    // On place un "capteur" juste devant les pieds de l'ennemi
    // Si dir = 1 (droite), on regarde à droite du sprite. Si dir = -1, à gauche.
    const lookAheadX = this.dir > 0 ? (this.x + this.w + 5) : (this.x - 5);
    const lookAheadY = this.y + this.h + 5; // Un peu en dessous des pieds

    let groundAhead = false;

    // On vérifie si ce point (lookAheadX, lookAheadY) touche une plateforme
    for (const p of L.platforms) {
      if (lookAheadX >= p.x && lookAheadX <= p.x + p.w &&
          lookAheadY >= p.y && lookAheadY <= p.y + p.h) {
        groundAhead = true;
        break;
      }
    }

    // 3. DÉTECTION DES MURS
    // On vérifie aussi si on va foncer dans un mur
    let wallAhead = false;
    const wallSensorX = this.dir > 0 ? (this.x + this.w) : this.x;
    for (const p of L.platforms) {
        // Si le capteur latéral touche une plateforme (mais pas par le dessus)
        if (AABB({x: nextX, y: this.y, w: this.w, h: this.h}, p)) {
            // Vérifie qu'on n'est pas juste posé dessus
            if (this.y + this.h > p.y + 5) { 
                wallAhead = true; 
            }
        }
    }

    // 4. PRISE DE DÉCISION
    // S'il n'y a pas de sol devant OU s'il y a un mur -> Demi-tour
    if (!groundAhead || wallAhead) {
      this.dir *= -1;
    } else {
      // Sinon, on avance
      this.x += (this.speed * this.dir);
    }

    // Physique Verticale (Gravité) pour le spawn initial
    this.dy += Game.gravity;
    this.y += this.dy;

    // Collision au sol (pour ne pas traverser le sol au spawn)
    for (const p of L.platforms) {
      if (AABB(this.rect(), p)) {
        if (this.dy > 0 && this.y + this.h - this.dy <= p.y) {
          this.y = p.y - this.h;
          this.dy = 0;
        }
      }
    }

    // Animation
    this.sheet.set('walk');
    this.sheet.step(dt, 0.8);
    
    // Si je vais à gauche, je retourne l'image
    // (Nécessite d'ajouter la logique de scale(-1,1) dans draw si voulu, 
    // mais pour l'instant ça marche sans)
  }

  draw() {
    if (!this.dead) {
        // Ajout du miroir pour l'ennemi aussi
        ctx.save();
        if(this.dir === 1) { // Si l'image de base regarde à gauche, inversez cette condition
             // Normal
             this.sheet.draw(this.x - Game.camX, this.y, this.w, this.h);
        } else {
             // Miroir
             ctx.translate(this.x - Game.camX + this.w/2, this.y);
             ctx.scale(-1, 1);
             this.sheet.draw(-this.w/2, 0, this.w, this.h);
        }
        ctx.restore();
    }
  }
}