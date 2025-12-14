class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 64, 64);
    this.sheet = new Sheet(ASSETS.enemy, SHEETS.enemy);
    this.dir = Math.random() < 0.5 ? -1 : 1; // Commence vers la gauche ou droite
    this.speed = 1.4; // Vitesse de marche
    this.dead = false;
  }

  update(dt, L) {
    if (this.dead) return;

    const lookAheadY = this.y + this.h + 5; // Un peu en dessous des pieds

    // Retourne l'info de collision/sol pour une direction donnÃ©e
    const probe = (dir) => {
      const lookAheadX = dir > 0 ? this.x + this.w + 5 : this.x - 5;
      let ground = false;
      for (const p of L.platforms) {
        if (
          lookAheadX >= p.x &&
          lookAheadX <= p.x + p.w &&
          lookAheadY >= p.y &&
          lookAheadY <= p.y + p.h
        ) {
          ground = true;
          break;
        }
      }

      let wall = false;
      const nextRect = { x: this.x + this.speed * dir, y: this.y, w: this.w, h: this.h };
      for (const p of L.platforms) {
        if (AABB(nextRect, p)) {
          if (this.y + this.h > p.y + 5) {
            wall = true;
            break;
          }
        }
      }

      return { ground, wall };
    };

    const forward = probe(this.dir);
    const backward = probe(-this.dir);

    const canForward = forward.ground && !forward.wall;
    const canBackward = backward.ground && !backward.wall;
    const isIdle = !canForward && !canBackward;

    // Mouvement horizontal : reste immobile s'il n'a pas de place
    if (!isIdle) {
      if (!canForward && canBackward) {
        this.dir *= -1;
      }
      this.x += this.speed * this.dir;
    }

    // Physique Verticale (GravitÃ©) pour le spawn initial
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
    this.sheet.set(isIdle ? "idle" : "walk");
    // Si immobile (idle), on ne dÃ©file pas l'animation
    const animSpeed = isIdle ? 0 : 0.8;
    this.sheet.step(dt, animSpeed);

    // Si je vais Ã  gauche, je retourne l'image
    // (NÃ©cessite d'ajouter la logique de scale(-1,1) dans draw si voulu,
    // mais pour l'instant Ã§a marche sans)
  }

  draw() {
    if (!this.dead) {
      // Ajout du miroir pour l'ennemi aussi
      ctx.save();
      if (this.dir === 1) {
        // Si l'image de base regarde Ã  gauche, inversez cette condition
        // Normal
        this.sheet.draw(this.x - Game.camX, this.y, this.w, this.h);
      } else {
        // Miroir
        ctx.translate(this.x - Game.camX + this.w / 2, this.y);
        ctx.scale(-1, 1);
        this.sheet.draw(-this.w / 2, 0, this.w, this.h);
      }
      ctx.restore();
    }
  }
}
