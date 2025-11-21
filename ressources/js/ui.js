/* ===========================
   SUPER RIJODA - UI & GAME STATE
   =========================== */

// ------- Game State -------
const Game = {
  running:true, paused:false,
  score:0, lives:3, time:0,
  particles: [],
  gravity:0.6, friction:0.85,
  worldW: 2000, worldH: 540, // Canvas Height
  camX:0,
  resetHUD(){ 
    UI.score.textContent=this.score; 
    UI.time.textContent = this.time.toFixed(2);
    UI.lives.textContent='❤️'.repeat(this.lives); 
  },

  // AUDIO
  bgmElement: new Audio(ASSETS.bgm),
  startBGM(){
    this.bgmElement.loop = true;
    this.bgmElement.volume = 0.3;
    this.bgmElement.play().catch(e => console.log('BGM Autoplay blocked:', e));
  },
  stopBGM(){
    this.bgmElement.pause();
    this.bgmElement.currentTime = 0;
  }
};

// ------- UI Elements -------
const UI = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives'),
  time:  document.getElementById('time'),
  pause: document.getElementById('pauseOverlay'),
  over:  document.getElementById('gameOver'),
  win:   document.getElementById('winScreen'),
  finalScore: document.getElementById('finalScore'),
  winScore:   document.getElementById('winScore'),
  show(el){el.hidden=false}, hide(el){el.hidden=true}
};

// ------- Lifecycle Functions -------
function end(win){
  Game.running = false;
  Game.stopBGM();
  
  // On formate le temps final proprement
  const finalTime = Game.time.toFixed(2);

  if (win) {
    // Affichage Victoire : Score Total + Temps Total
    UI.winScore.textContent = `${Game.score} pts | ${finalTime}s`;
    UI.show(UI.win);
  } else {
    // Affichage Défaite : Score accumulé jusqu'à la mort
    UI.finalScore.textContent = `${Game.score} pts`;
    UI.show(UI.over);
  }
}

function togglePause(force){
  Game.paused = force ?? !Game.paused;
  UI.pause.hidden = !Game.paused;
  if(Game.paused) Game.bgmElement.pause();
  else Game.bgmElement.play().catch(e => console.log('BGM error:', e));
}

// UI hooks
document.getElementById('resumeBtn').onclick=()=>togglePause(false);
document.getElementById('retryBtn').onclick=()=>{ location.reload(); };
document.getElementById('winMenuBtn').onclick=()=>{ location.href='loadingScreen.html'; };