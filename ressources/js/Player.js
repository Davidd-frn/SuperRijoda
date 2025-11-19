/* ===========================
   SUPER RIJODA - PLAYER
   =========================== */

class Player extends Entity{
    constructor(x, y) {
    super(x, y, 64, 64);   // hitbox du joueur

    // 2 spritesheets : course + attaque
    this.sheetRun    = new Sheet(ASSETS.playerRun,    SHEETS.playerRun);
    this.sheetAttack = new Sheet(ASSETS.playerAttack, SHEETS.playerAttack);
    this.sheet       = this.sheetRun;

    // état de jeu
    this.jump   = -12;
    this.invul  = 0;
    this.onGround = false;

    // direction et attaque
    this.facing          = 1;    // 1 = droite, -1 = gauche
    this.isAttacking     = false;
    this.attackTimer     = 0;
    this.attackDuration  = 0.25; // durée d'une attaque
    this.attackCooldown  = 0;    // délai mini entre deux attaques
  }

  update(dt, L){
    const prevX = this.x;
    const prevY = this.y;

    // ---- INPUT ----
    const left   = keys.has('ArrowLeft');
    const right  = keys.has('ArrowRight');
    const moving = left || right;

    if (right) {
      this.dx = 4;
      this.facing = 1;
    } else if (left) {
      this.dx = -4;
      this.facing = -1;
    } else {
      this.dx *= Game.friction;
    }

    if (keys.has('Space') && this.onGround) {
      this.dy = this.jump;
      this.onGround = false;
      playSFX(ASSETS.sfx_jump);
    }

    // ---- GESTION TEMPO D'ATTAQUE ----
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // démarrer une attaque quand on appuie sur A
    if (keys.has('KeyA') && !this.isAttacking && this.attackCooldown <= 0) {
      this.isAttacking    = true;
      this.attackTimer    = this.attackDuration;
      this.attackCooldown = 0.25;
      this.sheet          = this.sheetAttack;
      this.sheet.set('attack');
    }

    // ---- PHYSIQUE ----
    this.dy += Game.gravity;
    this.x  += this.dx;
    this.y  += this.dy;

    // ---- COLLISIONS PLATEFORMES (haut / bas / côtés) ----
    this.onGround = false;

    for (const p of L.platforms) {
      if (!AABB(this.rect(), p)) continue;

      const prevBottom = prevY + this.h;
      const prevTop    = prevY;
      const prevRight  = prevX + this.w;
      const prevLeft   = prevX;

      const currBottom = this.y + this.h;
      const currTop    = this.y;
      const currRight  = this.x + this.w;
      const currLeft   = this.x;

      // 1) on tombe SUR la plateforme
      if (prevBottom <= p.y && currBottom > p.y) {
        this.y = p.y - this.h;
        this.dy = 0;
        this.onGround = true;
        continue;
      }

      // 2) on tape la tête en dessous
      if (prevTop >= p.y + p.h && currTop < p.y + p.h) {
        this.y = p.y + p.h;
        this.dy = 0.5;
        continue;
      }

      // 3) côté gauche
      if (prevRight <= p.x && currRight > p.x) {
        this.x = p.x - this.w;
        this.dx = 0;
        continue;
      }

      // 4) côté droit
      if (prevLeft >= p.x + p.w && currLeft < p.x + p.w) {
        this.x = p.x + p.w;
        this.dx = 0;
        continue;
      }
    }

    // limites du monde
    this.x = clamp(this.x, 0, Game.worldW - this.w);
    this.y = Math.min(this.y, Game.worldH - this.h);

    // ---- PIÈCES ----
    for (const c of L.coins) {
      if (!c.taken && AABB(this.rect(), c.rect())) {
        c.taken = true;
        Game.score += 10;
        Game.resetHUD();
        playSFX(ASSETS.sfx_coin);
      }
    }

    // ---- ENNEMIS (saut dessus) ----
    for (const e of L.enemies) {
      if (e.dead) continue;
      if (AABB(this.rect(), e.rect())) {
        const fromTop = this.dy > 0 && (this.y + this.h - e.y) < 16;
        if (fromTop) {
          e.dead = true;
          this.dy = this.jump * 0.6;
          playSFX(ASSETS.sfx_hit);
        } else if (this.invul <= 0) {
          Game.lives--;
          this.invul = 60;
          Game.resetHUD();
          playSFX(ASSETS.sfx_damage);
          if (Game.lives <= 0) end(false);
        }
      }
    }

    // ---- HITBOX D'ÉPÉE QUAND ON ATTAQUE ----
    if (this.isAttacking) {
      const swordW = 40;
      const swordH = this.h * 0.6;
      const swordX = this.facing > 0
        ? this.x + this.w
        : this.x - swordW;
      const swordY = this.y + this.h * 0.2;

      const swordRect = { x: swordX, y: swordY, w: swordW, h: swordH };

      for (const e of L.enemies) {
        if (e.dead) continue;
        if (AABB(swordRect, e.rect())) {
          e.dead = true;
          playSFX(ASSETS.sfx_hit);
        }
      }
    }

    // ---- ANIMATIONS ----
    if (this.isAttacking) {
      this.sheet = this.sheetAttack;
      this.sheet.set('attack');
    } else {
      this.sheet = this.sheetRun;
      if (!this.onGround)      this.sheet.set('jump');
      else if (moving)         this.sheet.set('run');
      else                     this.sheet.set('idle');
    }

    if (this.invul > 0) this.invul--;
    this.sheet.step(dt, moving ? 1.6 : 0.9);
  }

  draw() {
    // 1. DEBUG : La boite rouge (Hitbox)
    // C'est la réalité physique du jeu. Le dessin doit rentrer dedans.
    const screenX = this.x - Game.camX;
    const screenY = this.y;
    
    // Decommentez pour voir la boite rouge si besoin :
    /*
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, this.w, this.h);
    ctx.restore();
    */

    if (this.invul > 0 && Math.floor(this.invul / 5) % 2 === 0) return;

    // --- CALCUL DE L'ÉCHELLE (SCALE) ---
    // Votre bonhomme fait ~680px de haut, la boite fait 64px.
    // 64 / 680 = environ 0.09. Essayons 0.12 pour qu'il déborde un peu (plus joli).
    const scale = 0.12; 

    const drawW = this.sheet.fw * scale; 
    const drawH = this.sheet.fh * scale;

    // On se place au centre des pieds de la hitbox
    const centerX = screenX + this.w / 2;
    const bottomY = screenY + this.h;

    ctx.save();
    ctx.translate(centerX, bottomY);

    // Gestion du miroir (regarder à gauche)
    if (this.facing === -1) {
        ctx.scale(-1, 1);
    }

    // DESSIN
    // On dessine l'image centrée en X (-drawW/2)
    // Et on la remonte de sa hauteur (-drawH) pour que les pieds touchent le sol
    // J'ajoute un petit décalage Y (+4) pour "asseoir" le perso dans le sol
    this.sheet.draw(-drawW / 2, -drawH + 4, drawW, drawH);

    ctx.restore();
  }
}