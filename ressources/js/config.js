/* ===========================
   SUPER RIJODA - CONFIG
   =========================== */


const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');   

// ------- Assets (adapte les chemins à ton repo) -------
const ASSETS = {
  playerAttack:'ressources/images/mockup/playerAttack.png',
  playerRun:  'ressources/images/mockup/playerRun.png',
  enemy:   'ressources/images/mockup/enemies.png',
  coins:   'ressources/images/mockup/Coin-Mockup.png',
  // NOUVEAUX ASSETS AUDIO
  bgm:     'ressources/audio/level_theme.mp3',
  sfx_jump:'ressources/audio/jump.wav',
  sfx_coin:'ressources/audio/coin.wav',
  sfx_hit: 'ressources/audio/hit.wav',
  sfx_damage:'ressources/audio/damage.wav'
};

// ------- Sprite sheets (ajuste si tes frames diffèrent) -------
const SHEETS = {
  playerRun: {
    cols: 4, rows: 3, 
    scale: 0.12, 
    fw: 512,     // Largeur basée sur 484 / 4
    fh: 682,     // Hauteur basée sur 336 / 3
    seq: { idle: [0], run: [0,1,2,3,4,5,6,7,8,9,10,11], jump: [6] }
  },
  playerAttack: {
    cols: 3, rows: 3, // Si votre image playerAttack.jpg est la dernière fournie (4x3)
    scale: 0.55,
    fw: 682,          // Largeur augmentée pour l'épée
    fh: 682,
    seq: { attack: [0,1,2,3,4,5,6,7] }
  },
  enemy: {
    cols: 4, rows: 3, scale: 0.5,
    seq: { walk: [0,1,2,3] }
  },
  coin: {
    cols: 4, rows: 2, scale: 0.35,
    seq: { spin: [0,1,2,3,4,5,6,7] }
  }
};

// ------- Helpers -------
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const AABB=(a,b)=>a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
function playSFX(src, vol = 0.5){
  if (!Game.running || Game.paused) return;
  const audio = new Audio(src);
  audio.volume = vol;
  audio.play().catch(e => console.log('Audio error:', e));
}

// ------- Input -------
const keys=new Set();
addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','Space','KeyP','Escape'].includes(e.code)) e.preventDefault();
  keys.add(e.code);
  if((e.code==='KeyP'||e.code==='Escape') && Game.running){togglePause();}
});
addEventListener('keyup',e=>keys.delete(e.code));