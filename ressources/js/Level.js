/* ===========================
   SUPER RIJODA - LEVEL DATA & DRAWING
   =========================== */

// ------- Level data (style maquette) -------
const Level = {
  platforms: [
    {x:0,    y:480, w:Game.worldW, h:60},   // sol
    {x:220,  y:380, w:120,        h:20},
    {x:420,  y:330, w:120,        h:20},
    {x:640,  y:290, w:140,        h:20},
    {x:920,  y:360, w:120,        h:20},
    {x:1180, y:320, w:120,        h:20},
    {x:1460, y:280, w:140,        h:20},
    {x:1820, y:320, w:120,        h:20}
  ],

  coins: [
    new Coin(250, 350),
    new Coin(460, 300),
    new Coin(680, 260),
    new Coin(950, 330),
    new Coin(1200,290),
    new Coin(1480,250)
  ],

  enemies: [
    new Enemy(980, 300),
    new Enemy(1350,260)
  ],

  goal: { x:1850, y:255, w:24, h:80 }   // torii / sortie
};

// ------- Drawing -------
function drawBackground(){
  ctx.fillStyle = '#e3a576'; ctx.fillRect(-Game.camX,0,Game.worldW,540);
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