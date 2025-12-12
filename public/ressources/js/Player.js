/* ===========================
   SUPER RIJODA - PLAYER (CORRIGÉ)
   =========================== */

class Player extends Entity {
  constructor(x, y) {
    super(x, y, 64, 64); // Hitbox du joueur

    // Spritesheets : course + attaque
    this.sheetRun = new Sheet(
      ASSETS.playerRun,
      PLAYER_SHEET_RUN || SHEETS.playerRun
    );
    this.sheetAttack = new Sheet(
      ASSETS.playerAttack,
      PLAYER_SHEET_ATTACK || SHEETS.playerAttack
    );
    this.sheet = this.sheetRun;
    this.matchDefaultSize = !!(
      typeof PLAYER_SKIN !== "undefined" && PLAYER_SKIN.matchDefaultSize
    );
    this.baseDrawHeight = SHEETS.playerRun.fh * SHEETS.playerRun.scale;
    this.drawScale =
      typeof PLAYER_SKIN !== "undefined" && PLAYER_SKIN.scale
        ? PLAYER_SKIN.scale
        : SHEETS.playerRun.scale;
    this.tintFilter =
      typeof PLAYER_SKIN !== "undefined" && PLAYER_SKIN.filter
        ? PLAYER_SKIN.filter
        : "none";
    this.scaledOnce = false;

    // État de jeu
    this.jump = -12;
    this.invul = 0;
    this.onGround = false;

    // Direction et Attaque
    this.facing = 1; // 1 = droite, -1 = gauche
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.25; // Durée de l'animation d'attaque
    this.attackCooldown = 0; // Délai entre deux attaques
    this.shurikenCooldown = 0; // Délai entre deux shurikens
  }

  update(dt, L) {
    const prevX = this.x;
    const prevY = this.y;

    // ---- 1. INPUTS (MOUVEMENT) ----
    const left = keys.has("ArrowLeft");
    const right = keys.has("ArrowRight");
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

    // Saut
    if (keys.has("Space") && this.onGround) {
      this.dy = this.jump;
      this.onGround = false;
      playSFX(ASSETS.sfx_jump);
    }

    // ---- 2. INPUTS (ATTAQUE) - RETABLIS ----
    // Gestion des timers
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) this.isAttacking = false;
    }
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }


    // Gestion du cooldown
    if (this.shurikenCooldown > 0) this.shurikenCooldown -= dt;

    // TIRE AVEC LA TOUCHE 'F'
    if (keys.has("KeyF") && this.shurikenCooldown <= 0) {
        this.shurikenCooldown = 0.5; // Délai de 0.5 seconde entre chaque tir
        
        // Créer le shuriken devant le joueur
        const spawnX = this.facing === 1 ? this.x + this.w : this.x - 24;
        const s = new Shuriken(spawnX, this.y + 20, this.facing);
        
        // Ajouter le shuriken au niveau
        L.projectiles.push(s);
        
        playSFX(ASSETS.sfx_throw);
    }


    // Déclenchement avec 'A'
    if (keys.has("KeyA") && !this.isAttacking && this.attackCooldown <= 0) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.attackCooldown = 0.4; // Petit délai avant de pouvoir ré-attaquer
      this.sheet = this.sheetAttack;
      this.sheet.set("attack");
      playSFX(ASSETS.sfx_attack); 
    }

    // ---- 3. PHYSIQUE ----
    this.dy += Game.gravity;
    this.x += this.dx;
    this.y += this.dy;

    // ---- 4. COLLISIONS PLATEFORMES (NOUVELLE LOGIQUE) ----
    this.onGround = false;

    // On combine plateformes fixes et mobiles
    const allPlatforms = [...L.platforms, ...(L.movingPlatforms || [])];

    for (const p of allPlatforms) {
      // Vérif basique collision rectangle
      const pRect = p.rect ? p.rect() : { x: p.x, y: p.y, w: p.w, h: p.h };
      if (!AABB(this.rect(), pRect)) continue;

      const prevBottom = prevY + this.h;

      // ATTERRISSAGE (Valable pour toutes les plateformes)
      // Si on tombe (dy >= 0) et qu'on était au-dessus avant
      if (this.dy >= 0 && prevBottom <= p.y + 12) {
        // Marge de tolérance
        this.y = p.y - this.h;
        this.dy = 0;
        this.onGround = true;

        // Si c'est une plateforme mobile, on bouge avec elle
        if (p instanceof MovingPlatform) {
          this.x += p.dx;
          this.y += p.dy;
        }
        continue;
      }

      // Si c'est une plateforme traversable (bleue), on ignore les murs/plafond
      if (p.oneWay) continue;

      // COLLISIONS SOLIDES (Murs et Plafond)
      const prevTop = prevY;
      const currTop = this.y;
      const prevRight = prevX + this.w;
      const prevLeft = prevX;
      const currRight = this.x + this.w;
      const currLeft = this.x;

      // Tête dans le plafond
      if (prevTop >= p.y + p.h && currTop < p.y + p.h) {
        this.y = p.y + p.h;
        this.dy = 0.5;
        continue;
      }
      // Mur Gauche
      if (prevRight <= p.x && currRight > p.x) {
        this.x = p.x - this.w;
        this.dx = 0;
      }
      // Mur Droit
      else if (prevLeft >= p.x + p.w && currLeft < p.x + p.w) {
        this.x = p.x + p.w;
        this.dx = 0;
      }
    }

    // ---- 5. LIMITES DU MONDE ----
    this.x = clamp(this.x, 0, Game.worldW - this.w);

    // Mort dans le vide
    if (this.y > Game.worldH) {
      Game.lives--;
      playSFX(ASSETS.sfx_damage);
      if (Game.lives > 0) {
        this.x = Level.respawnX;
        this.y = Level.respawnY - 20;
        this.dy = 0; // Respawn en l'air
        Game.resetHUD();
      } else {
        end(false);
      }
    }

    // ---- 6. INTERACTION PIÈCES & ENNEMIS ----

    // Pièces
    for (const c of L.coins) {
      if (!c.taken && AABB(this.rect(), c.rect())) {
        c.taken = true;
        Game.score += 10;
        Game.resetHUD();
        playSFX(ASSETS.sfx_coin);
      }
    }

    // Ennemis (Collision corps à corps)
    for (const e of L.enemies) {
      if (e.dead) continue;
      if (AABB(this.rect(), e.rect())) {
        // Si on saute sur la tête (Mario style)
        const fromTop = this.dy > 0 && this.y + this.h - e.y < 24;

        if (fromTop) {
          e.dead = true;
          this.dy = this.jump * 0.6; // Rebond
          playSFX(ASSETS.sfx_hit);
          Game.score += 50;
          Game.resetHUD();
        } else if (this.invul <= 0) {
          // Sinon on prend des dégâts
          Game.lives--;
          this.invul = 60;
          Game.resetHUD();
          playSFX(ASSETS.sfx_damage);
          if (Game.lives <= 0) end(false);
        }
      }
    }

    // ---- 7. HITBOX D'ÉPÉE (QUAND ON ATTAQUE) - RETABLI ----
    if (this.isAttacking) {
      const swordW = 50; // Portée de l'épée
      const swordH = this.h * 0.6;
      // La hitbox apparait devant le joueur
      const swordX = this.facing > 0 ? this.x + this.w : this.x - swordW;
      const swordY = this.y + this.h * 0.2;

      const swordRect = { x: swordX, y: swordY, w: swordW, h: swordH };

      // Debug visuel de l'épée (décommenter pour voir le carré rouge)
      /*
      ctx.save(); ctx.fillStyle = "rgba(255,0,0,0.5)"; 
      ctx.fillRect(swordRect.x - Game.camX, swordRect.y, swordRect.w, swordRect.h); 
      ctx.restore();
      */

      for (const e of L.enemies) {
        if (e.dead) continue;
        if (AABB(swordRect, e.rect())) {
          e.dead = true;
          playSFX(ASSETS.sfx_hit);
          Game.score += 50;

          spawnExplosion(e.x + e.w / 2, e.y + e.h / 2, "#b84328", 15);
          Game.resetHUD();
        }
      }
    }

    // ---- 8. ANIMATIONS ----
    if (this.isAttacking) {
      this.sheet = this.sheetAttack;
      this.sheet.set("attack");
    } else {
      this.sheet = this.sheetRun;
      if (!this.onGround) this.sheet.set("jump");
      else if (moving) this.sheet.set("run");
      else this.sheet.set("idle");
    }

    if (this.invul > 0) this.invul--;
    this.sheet.step(dt, moving ? 1.6 : 0.9);
  }


  draw() {
    // Affichage optimisé (Centré + Scale)
    if (this.invul > 0 && Math.floor(this.invul / 5) % 2 === 0) return;

    if (
      this.matchDefaultSize &&
      !this.scaledOnce &&
      this.sheetRun.ready &&
      this.sheetRun.fh
    ) {
      this.drawScale = this.baseDrawHeight / this.sheetRun.fh;
      this.scaledOnce = true;
    }

    const scale = this.drawScale;
    const drawW = this.sheet.fw * scale;
    const drawH = this.sheet.fh * scale;
    const screenX = this.x - Game.camX;
    const centerX = screenX + this.w / 2;
    const bottomY = this.y + this.h;

    const footAdjust = PLAYER_SKIN.footAdjust ?? 4;

    ctx.save();
    ctx.translate(centerX, bottomY);

    if (this.facing === -1) ctx.scale(-1, 1);
    ctx.filter = this.tintFilter || "none";

    this.sheet.draw(-drawW / 2, -drawH + footAdjust, drawW, drawH);
    ctx.restore();
  }
  
}
