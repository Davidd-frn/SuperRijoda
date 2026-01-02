class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 64, 64);
    this.sheet = new Sheet(ASSETS.enemy, SHEETS.enemy);
    this.dir = Math.random() < 0.5 ? -1 : 1; // Starting direction
    this.speed = 1.4; // Walking speed
    this.dead = false;
  }

  update(dt, L) {
    if (this.dead) return;

    const lookAheadY = this.y + this.h + 5; // Position just below the foot

    // Returns whether there's ground and/or wall in the given direction
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
      // Check for wall in the next position
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

    // Horizontal Movement
    if (!isIdle) {
      if (!canForward && canBackward) {
        this.dir *= -1;
      }
      this.x += this.speed * this.dir;
    }

    // Vertical Physics (Gravity) for initial spawn
    this.dy += Game.gravity;
    this.y += this.dy;

    // Ground collision (to avoid falling through the ground at spawn)
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
    // If immobile, no animation
    const animSpeed = isIdle ? 0 : 0.8;
    this.sheet.step(dt, animSpeed);

    // If the enemy is moving left or right, flip the sprite accordingly
    // Need to ensure the sprite sheet is facing the correct direction initially
    // but for now it works without it
  }

  draw() {
    if (!this.dead) {
      // Add the mirroring logic here
      ctx.save();
      if (this.dir === 1) {
        // If facing right, draw normally
        this.sheet.draw(this.x - Game.camX, this.y, this.w, this.h);
      } else {
        // Mirror
        ctx.translate(this.x - Game.camX + this.w / 2, this.y);
        ctx.scale(-1, 1);
        this.sheet.draw(-this.w / 2, 0, this.w, this.h);
      }
      ctx.restore();
    }
  }
}
