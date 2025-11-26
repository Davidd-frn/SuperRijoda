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

// ------- Leaderboard storage -------
const LEADERBOARD_KEY = 'leaderboard';
const COUNTRY_KEY = 'playerCountryCode';

function countryCodeToFlag(code){
  if (!code || code.length !== 2) return '';
  const offset = 127397;
  return String.fromCodePoint(...code.toUpperCase().split('').map(c=>c.charCodeAt(0)+offset));
}

function saveLeaderboard(score){
  try{
    const name = (localStorage.getItem('playerName') || 'Anonymous').trim() || 'Anonymous';
    const locRaw = localStorage.getItem('playerLocation');
    const countryCode = (localStorage.getItem(COUNTRY_KEY) || '').trim().toUpperCase();
    const flag = countryCodeToFlag(countryCode);
    let location = null;
    if (locRaw) {
      try { location = JSON.parse(locRaw); } catch(e){ location = locRaw; }
    }
    let entries = [];
    try{ entries = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || []; }catch(e){ entries = []; }
    const existing = entries.find(e => e && e.name === name);
    if (existing){
      if ((existing.score ?? 0) < score){
        existing.score = score;
        existing.location = location ?? existing.location ?? null;
        existing.countryCode = countryCode || existing.countryCode || '';
        existing.flag = flag || existing.flag || '';
      }
    } else {
      entries.push({ name, score, location, countryCode, flag });
    }
    entries.sort((a,b)=>(b.score||0)-(a.score||0));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (err){
    console.warn('Could not save leaderboard', err);
  }
}

// ------- Lifecycle Functions -------
function end(win){
  Game.running = false;
  Game.stopBGM();
  saveLeaderboard(Game.score);
  
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
