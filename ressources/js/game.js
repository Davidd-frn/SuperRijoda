/* ===========================
   SUPER RIJODA - GAME ENGINE (CORE)
   =========================== */

// ------- Player + camera -------
const player = new Player(60,380);
function updateCamera(){
  Game.camX = clamp(player.x - canvas.width/2, 0, Game.worldW - canvas.width);
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

// boot
Game.resetHUD();
Game.startBGM();
requestAnimationFrame(loop);