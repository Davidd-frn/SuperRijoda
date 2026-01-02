/* ===========================
   SUPER RIJODA - GAME ENGINE (CORE)
   =========================== */

// Configuration of the canvas
const bgImages = [];
// List of background image files for different levels
const bgFiles = [
  "ressources/images/background/BG-Lvl1.png", 
  "ressources/images/background/BG-Lvl2.png", 
  "ressources/images/background/BG-Lvl3.png",
];

// Automatically load background images
bgFiles.forEach((file) => {
  const img = new Image();
  img.src = withBase(file);
  bgImages.push(img);
});

// Variable to track the current level index
let currentLevelIndex = 0;

// ------- Player + camera -------
// We place the player at the starting position
const player = new Player(60, 380);

// function to draw the parallax background
function drawParallaxBackground() {
  const imgIndex = currentLevelIndex % bgImages.length;
  const bgToDraw = bgImages[imgIndex];

  // 2. Security check: if the image is not loaded yet, fill with black
  if (!bgToDraw || !bgToDraw.complete) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // 3. Calcul of parallax position
  const parallaxSpeed = 0.5; // Speed of parallax (0 = static, 0.5 = half speed of camera)

  // We calculate the x position of the background
  const xPos = -(Game.camX * parallaxSpeed) % bgToDraw.width;

  // 4. Then we draw the image
  // We ensure to cover the entire canvas width
  ctx.drawImage(bgToDraw, xPos, 0, bgToDraw.width, canvas.height);

  // 5. Draw a second image if needed to cover the entire canvas
  if (xPos + bgToDraw.width < canvas.width) {
    ctx.drawImage(
      bgToDraw,
      xPos + bgToDraw.width,
      0,
      bgToDraw.width,
      canvas.height
    );
  }
}

function updateCamera() {
  // The camera follows the player, centered on them
  Game.camX = clamp(player.x - canvas.width / 2, 0, Game.worldW - canvas.width);
}

// ------- Loop & lifecycle -------
let last = 0;
window.__stopGameLoop = false;

function loop(t) {
  if (window.__stopGameLoop) return;
  if (!Game.running) return;
  if (Game.paused) {
    requestAnimationFrame(loop);
    return;
  }

  // Delta time calcul to limit to 50ms max (to avoid big jumps)
  const dt = Math.min((t - last) / 1000, 0.05);
  last = t;

  // Time
  Game.time += dt;
  UI.time.textContent = Game.time.toFixed(2);

  // Update the particles
  for (let i = Game.particles.length - 1; i >= 0; i--) {
    const p = Game.particles[i];
    p.update();
    if (p.life <= 0) {
      Game.particles.splice(i, 1); // Delete the particle if its life is over
    }
  }

  // 1. Update the player
  player.update(dt, Level);

  // 2. Update the Level
  // It's here that level.js will update all entities
  Level.update(dt);

  // 3. Update the Camera
  updateCamera();

  // 4. Check for victory (touching the star)
  if (Level.goal && AABB(player.rect(), Level.goal)) {
    advanceLevel();
  }

  // --- DRAW ---
  drawParallaxBackground();
  Level.draw();
  player.draw();
  Game.particles.forEach((p) => p.draw());

  // We loop
  requestAnimationFrame(loop);
}


// --- START GAME ---

// 1. We load the level data
if (typeof Level1Data !== "undefined") {
  Level.init(Level1Data);
} else {
  console.error(
    "Error: Level1Data not found. Check the order of scripts in the HTML."
  );
}

// 2.We reset the in-game HUD
Game.resetHUD();

// 3. Start the background music
Game.startBGM();

requestAnimationFrame(loop);

function advanceLevel() {
  Level.next(); // Load the next level
  currentLevelIndex++;
  // Reset player position
  player.x = 60;
  player.y = 300;
  player.dx = 0;
  player.dy = 0;
  if (typeof Game !== "undefined" && Game.resetHUD) Game.resetHUD();
}
