/* ===========================
   SUPER RIJODA - UI & GAME STATE
   =========================== */

// ------- Game State -------
const Game = {
  running: true,
  paused: false,
  score: 0,
  lives: 3,
  time: 0,
  particles: [],
  gravity: 0.6,
  friction: 0.85,
  worldW: 2000,
  worldH: 540, // Canvas Height
  camX: 0,
  resetHUD() {
    UI.score.textContent = this.score;
    UI.time.textContent = this.time.toFixed(2);
    if (UI.level && typeof Level !== "undefined") {
      const displayLevel =
        typeof Level.getDisplayLevel === "function"
          ? Level.getDisplayLevel()
          : Level.currentId || 1;
      UI.level.textContent = displayLevel;
    }
    const LIFE_ICON = "❤️";
    UI.lives.textContent = LIFE_ICON.repeat(this.lives);
  },

  // AUDIO
  bgmElement: new Audio(ASSETS.bgm),
  startBGM() {
    window.__bgmElement = this.bgmElement;
    this.bgmElement.loop = true;
    this.bgmElement.volume = 0.3;
    this.bgmElement
      .play()
      .catch((e) => console.log("BGM Autoplay blocked:", e));
  },
  stopBGM() {
    this.bgmElement.pause();
    this.bgmElement.currentTime = 0;
    if (window.__bgmElement) {
      window.__bgmElement.pause();
      window.__bgmElement.currentTime = 0;
    }
  },
};
window.__bgmElement = Game.bgmElement;

// ------- UI Elements -------
const UI = {
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  time: document.getElementById("time"),
  level: document.getElementById("level"),
  pause: document.getElementById("pauseOverlay"),
  over: document.getElementById("gameOver"),
  win: document.getElementById("winScreen"),
  finalScore: document.getElementById("finalScore"),
  winScore: document.getElementById("winScore"),
  show(el) {
    el.hidden = false;
  },
  hide(el) {
    el.hidden = true;
  },
};

// ------- Leaderboard storage -------
const LEADERBOARD_KEY = "leaderboard";
const COUNTRY_KEY = "playerCountryCode";
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
  const [{ initializeApp }, firestore, authModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"),
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const { getFirestore, collection, doc, getDoc, setDoc } = firestore;
  const { getAuth, signInAnonymously } = authModule;
  const db = getFirestore(app);
  const auth = getAuth(app);
  // Ensure request.auth is present for Firestore writes guarded by rules.
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.warn("Anonymous auth failed", e);
  }
  firebaseApi = { db, auth, collection, doc, getDoc, setDoc };
  return firebaseApi;
}

// Merges two leaderboard entries, keeping the better score/time,
// but refreshing metadata (name, countryCode) from the latest entry.
function betterEntry(next, current) {
  if (!current) return next;
  const scoreNext = Number(next?.score) || 0;
  const scoreCur = Number(current?.score) || 0;
  const timeNextRaw = Number(next?.time);
  const timeCurRaw = Number(current?.time);
  const timeNext = Number.isFinite(timeNextRaw) ? timeNextRaw : Infinity;
  const timeCur = Number.isFinite(timeCurRaw) ? timeCurRaw : Infinity;

  const betterScore = scoreNext > scoreCur;
  const sameScore = scoreNext === scoreCur;
  const betterTimeWithSameScore = sameScore && timeNext < timeCur;
  const keepCurrent = !betterScore && !betterTimeWithSameScore;

  // Always refresh metadata (e.g., countryCode) from the latest submission.
  const mergedMeta = {
    ...current,
    countryCode: next?.countryCode || current?.countryCode || "",
    name: next?.name || current?.name,
  };

  if (keepCurrent) {
    return mergedMeta; // keep old score/time, but update meta
  }

  // Take the better performance, but keep refreshed meta.
  return {
    ...mergedMeta,
    score: scoreNext,
    time: Number.isFinite(timeNext) ? timeNext : null,
  };
}

// Saves leaderboard entry remotely to Firestore (best-effort; non-blocking).
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
    // Only send fields allowed by Firestore rules.
    const payload = {
      name: String(best?.name || "Anonymous").slice(0, 50),
      score: Number(best?.score) || 0,
      time: Number.isFinite(best?.time) ? best.time : null,
      countryCode:
        typeof best?.countryCode === "string" && best.countryCode.length === 2
          ? best.countryCode.toUpperCase()
          : "",
    };
    await setDoc(docRef, payload);
  } catch (err) {
    console.warn("Could not persist to Firestore", err);
  }
}

// Sorting function for leaderboard entries
function sortLeaderboard(a, b) {
  const scoreA = a.score || 0;
  const scoreB = b.score || 0;
  const timeA = a.time || Infinity;
  const timeB = b.time || Infinity;

  // Sort 1: By Score
  if (scoreA !== scoreB) {
    return scoreB - scoreA;
  }
  // Sort 2: By Time (ascending)
  return timeA - timeB;
}

// Saves leaderboard entry locally and remotely
function saveLeaderboard(score) {
  try {
    const time = Game.time;
    const name =
      (localStorage.getItem("playerName") || "Anonymous").trim() || "Anonymous";
    const locRaw = localStorage.getItem("playerLocation");
    const countryCode = (localStorage.getItem(COUNTRY_KEY) || "")
      .trim()
      .toUpperCase();

    let location = null;
    if (locRaw) {
      try {
        location = JSON.parse(locRaw);
      } catch (e) {
        location = locRaw;
      }
    }
    let entries = [];
    try {
      entries = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
    } catch (e) {
      entries = [];
    }
    const existing = entries.find((e) => e && e.name === name);
    if (existing) {
      const existingScore = Number(existing.score) || 0;
      const existingTime = Number.isFinite(Number(existing.time))
        ? Number(existing.time)
        : Infinity;
      const isNewBestScore = score > existingScore;
      const isBetterTimeWithSameScore =
        score === existingScore && time < existingTime;

      if (isNewBestScore || isBetterTimeWithSameScore) {
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
  } catch (err) {
    console.warn("Could not save leaderboard", err);
  }
}

// ------- Lifecycle Functions -------
function end(win) {
  Game.running = false;
  Game.stopBGM();

  // Format final time to 5 decimal places
  const finalTime = Game.time.toFixed(5);
  saveLeaderboard(Game.score);

  if (win) {
    // Victory Display: Score + Time
    UI.winScore.textContent = `${Game.score} pts | ${finalTime}s`;
    UI.show(UI.win);
  } else {
    // Defeat Display: Score only
    UI.finalScore.textContent = `${Game.score} pts`;
    UI.show(UI.over);
  }
}

// Toggles pause state
function togglePause(force) {
  Game.paused = force ?? !Game.paused;
  UI.pause.hidden = !Game.paused;
  if (Game.paused) Game.bgmElement.pause();
  else Game.bgmElement.play().catch((e) => console.log("BGM error:", e));
}

// UI hooks
document.getElementById("resumeBtn").onclick = () => togglePause(false);
document.getElementById("retryBtn").onclick = () => {
  location.href = "/SuperRijoda/play";
};
document.getElementById("winMenuBtn").onclick = () => {
  location.href = "/game";
};
