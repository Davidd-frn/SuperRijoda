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
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBHxxKPcTca5MKyBGw7KlGQpkv8gKZPd08",
  authDomain: "super-rijoda.firebaseapp.com",
  projectId: "super-rijoda",
  storageBucket: "super-rijoda.firebasestorage.app",
  messagingSenderId: "511869869048",
  appId: "1:511869869048:web:ff06987dee9f2b8b71d40d",
  measurementId: "G-W4HZR80TB0",
};

let firebaseApi = null;
async function getFirestoreApi() {
  if (firebaseApi) return firebaseApi;
  const [{ initializeApp }, firestore] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"),
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const { getFirestore, collection, doc, getDoc, setDoc } = firestore;
  const db = getFirestore(app);
  firebaseApi = { db, collection, doc, getDoc, setDoc };
  return firebaseApi;
}

function betterEntry(next, current) {
  if (!current) return next;
  const scoreNext = next?.score ?? 0;
  const scoreCur = current?.score ?? 0;
  if (scoreNext !== scoreCur) return scoreNext > scoreCur ? next : current;
  const timeNext = Number.isFinite(next?.time) ? next.time : Infinity;
  const timeCur = Number.isFinite(current?.time) ? current.time : Infinity;
  if (timeNext !== timeCur) return timeNext < timeCur ? next : current;
  // If score/time are equal, prefer the newer entry to refresh metadata (e.g., countryCode).
  return next;
}

async function saveLeaderboardRemote(entry) {
  try {
    const { db, collection, doc, getDoc, setDoc } = await getFirestoreApi();
    const colRef = collection(db, "leaderboard");
    const docId =
      (entry.name || "player")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .slice(0, 32) || "player";
    const docRef = doc(colRef, docId);
    const snap = await getDoc(docRef);
    const current = snap.exists() ? snap.data() : null;
    const best = betterEntry(entry, current);
    await setDoc(docRef, { ...best, updatedAt: Date.now() });
  } catch (err) {
    console.warn("Could not persist to Firestore", err);
  }
}

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
    const name = (localStorage.getItem("playerName") || "Anonymous").trim() || "Anonymous";
    const locRaw = localStorage.getItem("playerLocation");
    const countryCode = (localStorage.getItem(COUNTRY_KEY) || "").trim().toUpperCase();
    
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
        existing.time = time; // <-- update time
      }
      // Always refresh location/country when available, even if score/time unchanged.
      existing.location = location ?? existing.location ?? null;
      existing.countryCode = countryCode || existing.countryCode || "";
    } else {
      entries.push({ name, score, time, location, countryCode });
    }

    entries.sort(sortLeaderboard);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    // Best effort remote save; non-blocking for gameplay.
    saveLeaderboardRemote({ name, score, time, countryCode });
  } catch (err){
    console.warn("Could not save leaderboard", err);
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


