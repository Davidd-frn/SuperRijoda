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
    UI.score.textContent = this.score; 
    UI.time.textContent = this.time.toFixed(2);
    if (UI.level && typeof Level !== "undefined") {
      const displayLevel = typeof Level.getDisplayLevel === "function"
        ? Level.getDisplayLevel()
        : (Level.currentId || 1);
      UI.level.textContent = displayLevel;
    }
    const LIFE_ICON = '❤️';
    UI.lives.textContent = LIFE_ICON.repeat(this.lives); 
  },

  // AUDIO
  bgmElement: new Audio(ASSETS.bgm),
  startBGM(){
    window.__bgmElement = this.bgmElement;
    this.bgmElement.loop = true;
    this.bgmElement.volume = 0.3;
    this.bgmElement.play().catch(e => console.log('BGM Autoplay blocked:', e));
  },
  stopBGM(){
    this.bgmElement.pause();
    this.bgmElement.currentTime = 0;
    if (window.__bgmElement) {
      window.__bgmElement.pause();
      window.__bgmElement.currentTime = 0;
    }
  }
};
window.__bgmElement = Game.bgmElement;

// ------- UI Elements -------
const UI = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives'),
  time:  document.getElementById('time'),
  level: document.getElementById('level'),
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

function sortLeaderboard(a, b) {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    const timeA = a.time || Infinity;
    const timeB = b.time || Infinity;

    // Tri 1: Par Score (descendant)
    if (scoreA !== scoreB) {
        return scoreB - scoreA;
    }
    // Tri 2: Si scores égaux, par Temps (ascendant)
    return timeA - timeB;
}

function saveLeaderboard(score){
  try{
    const time = Game.time;
    const name = (localStorage.getItem('playerName') || 'Anonymous').trim() || 'Anonymous';
    const locRaw = localStorage.getItem('playerLocation');
    const countryCode = (localStorage.getItem(COUNTRY_KEY) || '').trim().toUpperCase();
    
    let location = null;
    if (locRaw) {
      try { location = JSON.parse(locRaw); } catch(e){ location = locRaw; }
    }
    let entries = [];
    try{ entries = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || []; }catch(e){ entries = []; }
    const existing = entries.find(e => e && e.name === name);
    if (existing){
      const isNewBestScore = score > (existing.score ?? 0);
      const isBetterTimeWithSameScore = score === (existing.score ?? 0) && time < (existing.time ?? Infinity);

      if (isNewBestScore || isBetterTimeWithSameScore){
        existing.score = score;
        existing.time = time; // <-- Mise à jour du temps
        existing.location = location ?? existing.location ?? null;
        existing.countryCode = countryCode || existing.countryCode || '';
      }
    } else {
      entries.push({ name, score, time, location, countryCode });
    }

    entries.sort(sortLeaderboard);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (err){
    console.warn('Could not save leaderboard', err);
  }
}

// ------- Lifecycle Functions -------
function end(win){
  Game.running = false;
  Game.stopBGM();
  
  // On formate le temps final proprement
  const finalTime = Game.time.toFixed(5);
  saveLeaderboard(Game.score);

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
document.getElementById('retryBtn').onclick=()=>{ location.href='/play'; };
document.getElementById('winMenuBtn').onclick=()=>{ location.href='/game'; };
