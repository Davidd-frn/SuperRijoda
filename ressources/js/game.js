/* ===========================
   SUPER RIJODA - GAME ENGINE
   =========================== */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ------- Assets (adapte les chemins à ton repo) -------
const ASSETS = {
  playerAttack:'ressources/images/mockup/playerAttack.png',
  playerRun:  'ressources/images/mockup/playerRun.png',
  enemy:   'ressources/images/mockup/enemies.png',
  coins:   'ressources/images/mockup/Coin-Mockup.png'
};

// ------- Sprite sheets (ajuste si tes frames diffèrent) -------
const SHEETS = {
  // playerRun.png : 4 colonnes x 3 lignes
  playerRun: {
    cols: 4,
    rows: 3,
    scale: 0.6,
    seq: {
      // indices :
      // ligne 1 : 0  1  2  3
      // ligne 2 : 4  5  6  7
      // ligne 3 : 8  9 10 11

      idle: [0],                       // perso à l'arrêt
      run:  [4,5,6,7,8,9,10,11],       // 2ème + 3ème ligne = course fluide
      jump: [6]                        // une frame de course utilisée pour le saut
    }
  },

  // playerAttack.png : 4 colonnes x 3 lignes
  playerAttack: {
    cols: 4,
    rows: 3,
    scale: 0.6,
    seq: {
      attack: [0,1,2,3,4,5,6,7]       // premières frames d'attaque
    }
  },

  // enemies.png : 4 colonnes x 3 lignes
  enemy: {
    cols: 4,
    rows: 3,
    scale: 0.5,
    seq: {
      walk: [0,1,2,3]
    }
  },

  // Coin-Mockup.png : 4 colonnes x 2 lignes (8 frames)
  coin: {
    cols: 4,
    rows: 2,
    scale: 0.35,
    seq: {
      spin: [0,1,2,3,4,5,6,7]
    }
  }
};


// ------- Helpers -------
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const AABB=(a,b)=>a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;

// ------- Input -------
const keys=new Set();
addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','Space','KeyP','Escape'].includes(e.code)) e.preventDefault();
  keys.add(e.code);
  if((e.code==='KeyP'||e.code==='Escape') && Game.running){togglePause();}
});
addEventListener('keyup',e=>keys.delete(e.code));

// ------- Sprite class -------
class Sheet {
  constructor(src, spec){
    this.img = new Image();
    this.ready = false;

    // récupère cols, rows, scale, seq, éventuellement fw/fh si tu veux forcer
    Object.assign(this, spec);

    this.img.onload = () => {
      this.ready = true;
      // si fw/fh ne sont pas fournis, on les calcule automatiquement
      if (!this.fw) this.fw = this.img.width  / this.cols;
      if (!this.fh) this.fh = this.img.height / this.rows;
    };
    this.img.src = src;

    this.anim = 'idle';
    this.i = 0;            // index de frame dans la séquence
    this.t = 0;            // timer d'animation
    this.fps = 12;
  }

  set(name){
    if (this.anim !== name){
      this.anim = name;
      this.i = 0;
      this.t = 0;
    }
  }

  step(dt, speed = 1){
    const frames = this.seq[this.anim] || [0];
    if (frames.length < 2) return;

    this.t += dt * this.fps * speed;
    if (this.t >= 1){
      this.t = 0;
      this.i = (this.i + 1) % frames.length;
    }
  }

  draw(x, y, w, h){
    if (!this.ready) return;
    const frames = this.seq[this.anim] || [0];
    const idx = frames[this.i] ?? 0;
    const col = idx % this.cols;
    const row = Math.floor(idx / this.cols);

    ctx.drawImage(
      this.img,
      col * this.fw, row * this.fh, this.fw, this.fh,
      x, y, w, h
    );
  }
}

// ------- Game state -------
const UI = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives'),
  pause: document.getElementById('pauseOverlay'),
  over:  document.getElementById('gameOver'),
  win:   document.getElementById('winScreen'),
  finalScore: document.getElementById('finalScore'),
  winScore:   document.getElementById('winScore'),
  show(el){el.hidden=false}, hide(el){el.hidden=true}
};

const Game = {
  running:true, paused:false,
  score:0, lives:3,
  gravity:0.6, friction:0.85,
  worldW: 2000, worldH: canvas.height,
  camX:0,
  resetHUD(){ UI.score.textContent=`Score: ${this.score}`; UI.lives.textContent='❤️'.repeat(this.lives); }
};

// ------- Entities -------
class Entity{
  constructor(x,y,w,h){ this.x=x; this.y=y; this.w=w; this.h=h; this.dx=0; this.dy=0; this.onGround=false; }
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
}

class Player extends Entity {
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
        } else if (this.invul <= 0) {
          Game.lives--;
          this.invul = 60;
          Game.resetHUD();
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

  draw(){
    if (this.invul > 0 && Math.floor(this.invul/5)%2 === 0) return;

    const drawW = 80;
    const drawH = 80;
    const offsetX = (drawW - this.w) / 2;
    const offsetY = drawH - this.h;

    this.sheet.draw(
      this.x - Game.camX - offsetX,
      this.y - offsetY,
      drawW,
      drawH
    );
  }
}


class Enemy extends Entity{
  constructor(x,y){
    super(x,y,64,64);
    this.sheet=new Sheet(ASSETS.enemy,SHEETS.enemy);
    this.dir=Math.random()<.5?-1:1; this.speed=1.4; this.dead=false;
  }
  update(dt,L){
    if(this.dead) return;
    this.dx=this.speed*this.dir; this.dy+=Game.gravity;
    this.x+=this.dx; this.y+=this.dy;

    for(const p of L.platforms){
      if(AABB(this.rect(),p)){
        if(this.dy>0 && this.y+this.h-this.dy<=p.y){ this.y=p.y-this.h; this.dy=0; }
        else { this.dir*=-1; this.dx=0; }
      }
    }
    this.x=clamp(this.x,0,Game.worldW-this.w);
    this.y=Math.min(this.y,Game.worldH-this.h);

    this.sheet.set('walk'); this.sheet.step(dt,.8);
  }
  draw(){ if(!this.dead) this.sheet.draw(this.x-Game.camX,this.y,this.w,this.h); }
}

class Coin{
  constructor(x,y){ this.x=x; this.y=y; this.w=32; this.h=32; this.taken=false;
    this.sheet=new Sheet(ASSETS.coins,SHEETS.coin);
  }
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
  update(dt){ if(!this.taken){ this.sheet.set('spin'); this.sheet.step(dt,1.0); } }
  draw(){ if(!this.taken) this.sheet.draw(this.x-Game.camX,this.y,this.w,this.h); }
}

// ------- Level data (style maquette) -------
const Level = {
  platforms: [
    {x:0,y:480,w:Game.worldW,h:60},      // sol
    {x:220,y:380,w:120,h:20},
    {x:420,y:330,w:120,h:20},
    {x:640,y:290,w:140,h:20},
    {x:920,y:360,w:120,h:20},
    {x:1180,y:320,w:120,h:20},
    {x:1460,y:280,w:140,h:20},
    {x:1820,y:320,w:120,h:20}
  ],
  coins: [
    new Coin(250,350), new Coin(460,300), new Coin(680,260),
    new Coin(950,330), new Coin(1200,290), new Coin(1480,250)
  ],
  enemies: [ new Enemy(980,300), new Enemy(1350,260) ],
  goal: {x:1850,y:255,w:24,h:80} // zone d’arrivée (torii/étoile)
};

// ------- Player + camera -------
const player = new Player(60,380);
function updateCamera(){
  Game.camX = clamp(player.x - canvas.width/2, 0, Game.worldW - canvas.width);
}

// ------- Drawing -------
function drawBackground(){
  ctx.fillStyle = '#e3a576'; ctx.fillRect(-Game.camX,0,Game.worldW,canvas.height);
  ctx.fillStyle = '#d88f61'; ctx.fillRect(-Game.camX,420,Game.worldW,120);
}
function drawPlatforms(){
  ctx.fillStyle='#191919';
  for(const p of Level.platforms) ctx.fillRect(p.x-Game.camX,p.y,p.w,p.h);
}
function drawGoal(){
  const g=Level.goal; ctx.fillStyle='#f2c14e';
  ctx.fillRect(g.x-Game.camX,g.y,g.w,g.h);
}

// ------- Loop & lifecycle -------
let last=0;
function loop(t){
  if(!Game.running || Game.paused){ requestAnimationFrame(loop); return; }
  const dt=Math.min((t-last)/1000,0.05); last=t;

  // update
  player.update(dt,Level);
  Level.coins.forEach(c=>c.update(dt));
  Level.enemies.forEach(e=>e.update(dt,Level));
  updateCamera();

  // win ?
  if(AABB(player.rect(), Level.goal)) end(true);

  // draw
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBackground(); drawPlatforms(); drawGoal();
  Level.coins.forEach(c=>c.draw());
  Level.enemies.forEach(e=>e.draw());
  player.draw();

  requestAnimationFrame(loop);
}

function end(win){
  Game.running=false;
  if(win){ UI.winScore.textContent=`Score: ${Game.score}`; UI.show(UI.win); }
  else   { UI.finalScore.textContent=`Score: ${Game.score}`; UI.show(UI.over); }
}

function togglePause(force){
  Game.paused = force ?? !Game.paused;
  UI.pause.hidden = !Game.paused;
}

// UI hooks
document.getElementById('resumeBtn').onclick=()=>togglePause(false);
document.getElementById('retryBtn').onclick=()=>{ location.reload(); };
document.getElementById('winMenuBtn').onclick=()=>{ location.href='loadingScreen.html'; };

// boot
Game.resetHUD();
requestAnimationFrame(loop);