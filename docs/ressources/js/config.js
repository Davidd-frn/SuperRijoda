/* ===========================
   SUPER RIJODA - CONFIG
   =========================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const normalizeBase = (b) => {
  const val = typeof b === "string" && b.trim() ? b.trim() : "/";
  const prefixed = val.startsWith("/") ? val : `/${val}`;
  return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
};
const BASE_URL = normalizeBase(window.__BASE_URL__);
const withBase = (p = "") => {
  if (!p) return BASE_URL;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith("/") ? p.slice(1) : p;
  return `${BASE_URL}${clean}`;
};

// ------- Character library & selection -------
const CHARACTER_LIBRARY = {
  samurai: {
    id: "samurai",
    name: "Ronin", 
    run: withBase("ressources/images/mockup/ronin.png"),
    attack: withBase("ressources/images/mockup/ronin.png"),
    filter: "none",
    scale: 0.3, 
    footAdjust: 14,
    matchDefaultSize: true, 

    // Configuration for running/jumping (Lines 1 and 2) 
    sheetRunSpec: {
        cols: 4, rows: 3, // The sheet is 4 columns and 3 rows
        fw: null, fh: null, 
        seq: {
            idle: [0, 1, 2, 3],       
            run: [4, 5, 6, 7],        
            jump: [5]                 
        }
    },

    // Configuration for attacking (Line 3)
    sheetAttackSpec: {
        cols: 4, rows: 3,
        fw: null, fh: null,
        seq: {
            attack: [8, 9, 10, 11]  
        }
    },
  },
  women: {
    id: "women",
    name: "Women Warrior",
    run: withBase("ressources/images/mockup/womenPlayer.png"),
    attack: withBase("ressources/images/mockup/womenPlayer.png"),
    filter: "none",
    scale: 0.18,
    matchDefaultSize: true,
    footAdjust: 5,
    sheetRunSpec: {
        cols: 4,
        rows: 3,
        fw: null, fh: null, // Let frame size auto-calc
        seq: {
            idle: [0],               // Single idle frame
            run: [0, 1, 2, 3, 4, 5, 7], 
            jump: [2]                // One jump frame
        }
    },

    // Configuration for attacking (Line 3)
    sheetAttackSpec: {
        cols: 4,
        rows: 3,
        fw: null, fh: null,
        seq: {
            attack: [8, 9, 10, 11]   // The last row for attack
        }
    },
  },
  shadow: {
    id: "shadow",
    name: "Shadow Shinobi",
    run: withBase("ressources/images/mockup/ninja-sheet.png"),
    attack: withBase("ressources/images/mockup/ninja-sheet.png"),
    filter: "none",
    scale: 0.18,
    matchDefaultSize: true, // force same on-screen size as default
    footAdjust: 14, // push sprite further down so feet touch ground
    // Use the same grid as default but let frame size auto-calc so only one frame shows at a time
    sheetRunSpec: { 
      cols: 4, 
      rows: 3, 
      fw: null, 
      fh: null, 
      seq: { 
        idle: [8], 
        run: [0, 1, 2, 3], 
        jump: [6] 
      } 
    },
    sheetAttackSpec: { 
      cols: 4, 
      rows: 3, 
      fw: null, 
      fh: null, 
      seq: { 
        attack: [4, 5, 6, 7] 
      } 
    },
  },
};

const DEFAULT_CHARACTER_ID = "samurai";
// Try to get selected character from localStorage, else default
function getSelectedCharacterId() {
  try {
    const stored = localStorage.getItem("selectedCharacter");
    if (stored && CHARACTER_LIBRARY[stored]) return stored;
  } catch (err) {
    console.warn("LocalStorage not available, defaulting character", err);
  }
  return DEFAULT_CHARACTER_ID;
}

// Selected character data
const SELECTED_CHARACTER_ID = getSelectedCharacterId();
const PLAYER_SKIN =
  CHARACTER_LIBRARY[SELECTED_CHARACTER_ID] ??
  CHARACTER_LIBRARY[DEFAULT_CHARACTER_ID];

// Per-character player sheet specs (override defaults if provided)
// ------- Assets -------
const ASSETS = {
  playerAttack: PLAYER_SKIN.attack,
  playerRun: PLAYER_SKIN.run,
  enemy: withBase("ressources/images/mockup/enemies.png"),
  bat: withBase("ressources/images/mockup/bat-enemy.png"),
  coins: withBase("ressources/images/mockup/Coin-Mockup.png"),
  shuriken: withBase("ressources/images/mockup/shuriken.png"),
  // Audio 
  bgm: withBase("ressources/audio/level_theme.mp3"),
  sfx_jump: withBase("ressources/audio/jump.wav"),
  sfx_coin: withBase("ressources/audio/coin.wav"),
  sfx_hit: withBase("ressources/audio/hit.wav"),
  sfx_damage: withBase("ressources/audio/damage.wav"),
  sfx_throw: withBase("ressources/audio/shuriken_throw.wav"),
  sfx_attack: withBase("ressources/audio/slash.mp3"),
};

// ------- Sprite sheets -------
const SHEETS = {
  playerRun: {
    cols: 4,
    rows: 3,
    scale: 0.12,
    fw: 512, // Width based on 512 / 4
    fh: 682, // Height based on 682 / 3
    seq: { idle: [0], run: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], jump: [6] },
    footAdjust: 4,
  },
  playerAttack: {
    cols: 3,
    rows: 3, 
    scale: 0.55,
    fw: 682, // Width increased for the sword
    fh: 682,
    seq: { attack: [0, 1, 2, 3, 4, 5, 6, 7] },
  },
  enemy: {
    cols: 4,
    rows: 3,
    scale: 0.5,
    seq: { walk: [0, 1, 2, 3] },
  },
  bat: {
    cols: 4,
    rows: 3,
    scale: 0.15, 
    seq: { 
        fly: [0, 1, 2, 3],       
        attack: [4, 5, 6, 7],    
        sleep: [8, 9, 10, 11]    
    },
  },
  coin: {
    cols: 4,
    rows: 2,
    scale: 0.35,
    seq: { spin: [0, 1, 2, 3, 4, 5, 6, 7] },
  },
  shuriken: {
    cols: 1, 
    rows: 1,
    scale: 0.5, 
    seq: { spin: [0] }, 
  },
};

// Per-character player sheet specs (override defaults if provided)
const PLAYER_SHEET_RUN = PLAYER_SKIN.sheetRunSpec
  ? { ...SHEETS.playerRun, ...PLAYER_SKIN.sheetRunSpec }
  : SHEETS.playerRun;
const PLAYER_SHEET_ATTACK = PLAYER_SKIN.sheetAttackSpec
  ? { ...SHEETS.playerAttack, ...PLAYER_SKIN.sheetAttackSpec }
  : SHEETS.playerAttack;

// ------- Helpers -------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const AABB = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function playSFX(src, vol = 0.5) {
  if (!Game.running || Game.paused) return;
  const audio = new Audio(src);
  audio.volume = vol;
  audio.play().catch((e) => console.log("Audio error:", e));
}

// ------- Input -------
const keys = new Set();
addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "Space", "KeyP", "Escape"].includes(e.code))
    e.preventDefault();
  keys.add(e.code);
  if ((e.code === "KeyP" || e.code === "Escape") && Game.running) {
    togglePause();
  }
});
addEventListener("keyup", (e) => keys.delete(e.code));

// Clear inputs when the tab loses focus to avoid stuck movement keys
addEventListener("blur", () => keys.clear());
addEventListener("visibilitychange", () => {
  if (document.hidden) keys.clear();
});

// Function to spawn explosion particles
function spawnExplosion(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    Game.particles.push(new Particle(x, y, color, 5));
  }
}
