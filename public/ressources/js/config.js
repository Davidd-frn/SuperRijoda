/* ===========================
   SUPER RIJODA - CONFIG
   =========================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ------- Character library & selection -------
const CHARACTER_LIBRARY = {
  samurai: {
    id: "samurai",
    name: "Ronin", // Vous pouvez changer le nom ici
    run: "/ressources/images/mockup/ronin.png",
    attack: "/ressources/images/mockup/ronin.png",
    filter: "none",
    scale: 0.3, 
    footAdjust: 14,
    matchDefaultSize: true, 

    // Configuration pour les animations de course et saut 
    sheetRunSpec: {
        cols: 4, rows: 3, // Le spritesheet a 4 colonnes et 3 lignes
        fw: null, fh: null, 
        seq: {
            idle: [0, 1, 2, 3],       
            run: [4, 5, 6, 7],        
            jump: [5]                 
        }
    },

    // Configuration pour l'attaque (Ligne 3)
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
    run: "/ressources/images/mockup/womenPlayer.png",
    attack: "/ressources/images/mockup/womenPlayer.png",
    filter: "none",
    scale: 0.18,
    matchDefaultSize: true,
    footAdjust: 5,
    sheetRunSpec: {
        cols: 4,
        rows: 3,
        fw: null, fh: null, // Laisse le jeu calculer la taille des frames
        seq: {
            idle: [0],               // Frame statique
            run: [0, 1, 2, 3, 4, 5, 6, 7], // Les 2 premières lignes
            jump: [2]                // Une frame de saut arbitraire
        }
    },

    // Configuration pour l'attaque (utilise la ligne 3)
    sheetAttackSpec: {
        cols: 4,
        rows: 3,
        fw: null, fh: null,
        seq: {
            attack: [8, 9, 10, 11]   // La dernière ligne (indices 8,9,10,11)
        }
    },
  },
  shadow: {
    id: "shadow",
    name: "Shadow Shinobi",
    run: "/ressources/images/mockup/ninja-sheet.png",
    attack: "/ressources/images/mockup/ninja-sheet.png",
    filter: "none",
    scale: 0.18,
    matchDefaultSize: true, // force same on-screen size as default
    footAdjust: 14, // push sprite further down so feet touch ground
    // Use the same grid as default but let frame size auto-calc so only one frame shows at a time
    sheetRunSpec: { cols: 4, rows: 3, fw: null, fh: null, seq: { idle: [8], run: [0, 1, 2, 3], jump: [6] } },
    sheetAttackSpec: { cols: 4, rows: 3, fw: null, fh: null, seq: { attack: [4, 5, 6, 7] } },
  },
};

const DEFAULT_CHARACTER_ID = "samurai";
function getSelectedCharacterId() {
  try {
    const stored = localStorage.getItem("selectedCharacter");
    if (stored && CHARACTER_LIBRARY[stored]) return stored;
  } catch (err) {
    console.warn("LocalStorage not available, defaulting character", err);
  }
  return DEFAULT_CHARACTER_ID;
}

const SELECTED_CHARACTER_ID = getSelectedCharacterId();
const PLAYER_SKIN =
  CHARACTER_LIBRARY[SELECTED_CHARACTER_ID] ??
  CHARACTER_LIBRARY[DEFAULT_CHARACTER_ID];

// Per-character player sheet specs (override defaults if provided)
// ------- Assets (adapte les chemins à ton repo) -------
const ASSETS = {
  playerAttack: PLAYER_SKIN.attack,
  playerRun: PLAYER_SKIN.run,
  enemy: "/ressources/images/mockup/enemies.png",
  bat: "/ressources/images/mockup/bat-enemy.png",
  coins: "/ressources/images/mockup/Coin-Mockup.png",
  shuriken: "ressources/images/mockup/shuriken.png",
  // NOUVEAUX ASSETS AUDIO
  bgm: "/ressources/audio/level_theme.mp3",
  sfx_jump: "/ressources/audio/jump.wav",
  sfx_coin: "/ressources/audio/coin.wav",
  sfx_hit: "/ressources/audio/hit.wav",
  sfx_damage: "/ressources/audio/damage.wav",
  sfx_throw: "/ressources/audio/shuriken_throw.wav",
  sfx_attack: "/ressources/audio/slash.mp3",
};

// ------- Sprite sheets (ajuste si tes frames diffèrent) -------
const SHEETS = {
  playerRun: {
    cols: 4,
    rows: 3,
    scale: 0.12,
    fw: 512, // Largeur basée sur 484 / 4
    fh: 682, // Hauteur basée sur 336 / 3
    seq: { idle: [0], run: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], jump: [6] },
    footAdjust: 4,
  },
  playerAttack: {
    cols: 3,
    rows: 3, // Si votre image playerAttack.jpg est la dernière fournie (4x3)
    scale: 0.55,
    fw: 682, // Largeur augmentée pour l'épée
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

function spawnExplosion(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    Game.particles.push(new Particle(x, y, color, 5));
  }
}
