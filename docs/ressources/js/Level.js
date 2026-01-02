/* ===========================
   SUPER RIJODA - LEVEL MANAGER
   =========================== */

// --- Data for Level 1 (Intro) ---
const Level1Data = {
  id: 1,
  background: "#FFFFFF", 
  platforms: [
    { x: 0, y: 400, w: 200, h: 140 }, // Start
    { x: 300, y: 450, w: 150, h: 90 }, 
    { x: 550, y: 350, w: 150, h: 190 }, 
    { x: 720, y: 300, w: 100, h: 20 }, 
    { x: 850, y: 400, w: 110, h: 140 }, 
  ],
  coins: [
    { x: 360, y: 410 },
    { x: 760, y: 260 },
  ],
  enemies: [
    { x: 600, y: 280, type: "patrol", dist: 80 },
    { x: 600, y: 100, type: "bat", dist: 80 },
  ],
  goal: { x: 900, y: 350, w: 40, h: 40 },
};

// --- Data for Level 2 (Verticality + Springs) ---
const Level2Data = {
  id: 2,
  background: "#FFFFFF",
  platforms: [
    // Depart 
    { x: 0, y: 450, w: 200, h: 90 },

    // The first ascension (One Way Platforms)
    { x: 100, y: 350, w: 80, h: 20, oneWay: true },
    { x: 200, y: 280, w: 80, h: 20, oneWay: true },
    { x: 200, y: 200, w: 80, h: 20, oneWay: true },

    // High Platform
    { x: 300, y: 150, w: 200, h: 40 },

    // The descent (One Way Platforms)
    { x: 550, y: 220, w: 80, h: 20, oneWay: true },
    { x: 650, y: 300, w: 80, h: 20, oneWay: true },

    // The lower platform
    { x: 750, y: 450, w: 150, h: 90 },

    // The final ascension
    { x: 950, y: 250, w: 100, h: 290 },
  ],

  // Mobile Platforms
  movingPlatforms: [
    { x: 880, y: 320, w: 60, h: 20, rangeX: 0, rangeY: 90, speed: 2 },
  ],

  coins: [
    { x: 380, y: 110 },
    { x: 800, y: 410 },
  ],
  enemies: [
    { x: 350, y: 80, type: "patrol", dist: 100 },
    { x: 900, y: 180, type: "bat", dist: 120 },
  ],
  goal: { x: 970, y: 200, w: 40, h: 40 },

  // We delete spikes and springs for this level
  springs: [],
};

// --- Data for Level 3  ---
const Level3Data = {
  id: 3,
  background: "#FFFFFF",

  // 1. The platforms (Precision, Endurance, Timing)
  platforms: [
    { x: 0, y: 450, w: 150, h: 190 }, 

    // Step 1 : The Pillars (Precision) 
    { x: 200, y: 350, w: 50, h: 190 },
    { x: 350, y: 300, w: 50, h: 240 },
    { x: 500, y: 350, w: 50, h: 190 },

    // Step 2 : The Wall (Endurance)
    { x: 650, y: 400, w: 150, h: 140 },

    // Ascension with One Way Platforms
    { x: 800, y: 300, w: 80, h: 20, oneWay: true },
    { x: 650, y: 200, w: 80, h: 20, oneWay: true },
    { x: 800, y: 100, w: 80, h: 20, oneWay: true },

    // The summit platform
    { x: 950, y: 80, w: 300, h: 40 },

    // Step 3 : The Final Chasm (Timing)
    // Just a little platform before the gap
    { x: 2200, y: 250, w: 150, h: 40 },
  ],

  // 2. The Spikes (Filling the gaps)
  spikes: [
    { x: 150, y: 510 },
    { x: 180, y: 510 },
    { x: 250, y: 510 },
    { x: 280, y: 510 },
    { x: 310, y: 510 },
    { x: 400, y: 510 },
    { x: 430, y: 510 },
    { x: 460, y: 510 },
    { x: 550, y: 510 },
    { x: 580, y: 510 },
    { x: 610, y: 510 },
  ],

  // 3. Mobile Platforms (Fast and Dangerous)
  movingPlatforms: [
    // These platforms move in various patterns to challenge the player
    { x: 1300, y: 150, w: 80, h: 20, rangeX: 150, rangeY: 50, speed: 2.5 }, // Diagonal movement
    { x: 1650, y: 250, w: 80, h: 20, rangeX: 0, rangeY: 120, speed: 3.0 }, // Fast vertical
    { x: 1900, y: 200, w: 80, h: 20, rangeX: 150, rangeY: 0, speed: 2.5 }, // Last horizontal jump
  ],

  // 4. The Enemies (Placed strategically)
  enemies: [
    // On the first pillar
    { x: 375, y: 150, type: "patrol", dist: 20 },

    // During the wall climb
    { x: 810, y: 60, type: "patrol", dist: 60 },

    // At the summit, to welcome you after the climb
    { x: 1000, y: 40, type: "patrol", dist: 150 },

    { x: 1450, y: 100, type: "bat", dist: 120 },

    { x: 1800, y: 150, type: "bat", dist: 80 },
  ],

  coins: [
    { x: 375, y: 220 }, // On top of the first pillar
    { x: 690, y: 160 }, // During the wall climb
    { x: 1340, y: 110 }, // On the first moving platform
    { x: 1940, y: 160 }, // On the last moving platform
  ],

  checkpoints: [
    { x: 1100, y: 30 }, // At the summit, before the final chasm
  ],

  goal: { x: 2250, y: 200, w: 40, h: 40 },
};

// Registry for level data (preserves numeric order for progression)
const LEVEL_REGISTRY = {
  1: Level1Data,
  2: Level2Data,
  3: Level3Data,
};

// --- ASSETS ---
const goalStarImg = new Image();
goalStarImg.src = "/ressources/images/mockup/star.png";

// --- Cloud Platform Image ---
const cloudPlatformImg = new Image();
cloudPlatformImg.src = "/ressources/images/mockup/cloud_platform.png";

// --- One Way Platform Image ---
const oneWayPlatformImg = new Image();
oneWayPlatformImg.src = "/ressources/images/mockup/dirt_plateform.png";

// --- Wall Platform Image (pattern) ---
const wallPlatformImg = new Image();
wallPlatformImg.src = "/ressources/images/mockup/wall.png";

let wallPattern = null;
wallPlatformImg.onload = () => {
  wallPattern = ctx.createPattern(wallPlatformImg, "repeat");
  console.log("✅ wall pattern ready");
};
wallPlatformImg.onerror = () =>
  console.log("❌ wall NOT found", wallPlatformImg.src);

// Gestion of the current level
const Level = {
  platforms: [],
  movingPlatforms: [],
  coins: [],
  enemies: [],
  spikes: [],
  springs: [],
  checkpoints: [],
  respawnX: 60,
  respawnY: 100,
  goal: null,
  currentId: 1,
  bgColor: "#e3a576",
  loopCount: 0, // number of completed full cycles for endless mode

  // Load level data
  init(data) {
    this.currentId = data.id;

    this.respawnX = 60;
    this.respawnY = 90;

    // Load platforms
    this.platforms = data.platforms;

    // Load other entities
    this.movingPlatforms = (data.movingPlatforms || []).map(
      (m) => new MovingPlatform(m.x, m.y, m.w, m.h, m.rangeX, m.rangeY, m.speed)
    );

    const difficulty = 1 + this.loopCount * 0.15; // progressive scaling per loop
    this.coins = data.coins.map((c) => new Coin(c.x, c.y));
    this.enemies = (data.enemies || []).map((e) => {
      if (e.type === "bat") {
        const dist = e.dist ? e.dist * (1 + this.loopCount * 0.1) : e.dist;
        return new Bat(e.x, e.y, dist);
      }

      const en = new Enemy(e.x, e.y);
      if (e.type === "patrol") en.dist = e.dist;
      en.speed *= difficulty;
      return en;
    });

    // Scale moving platforms speed with difficulty
    this.movingPlatforms.forEach((m) => {
      m.speed *= difficulty;
    });
    this.spikes = (data.spikes || []).map((s) => new Spike(s.x, s.y));
    this.springs = (data.springs || []).map((s) => new Spring(s.x, s.y));
    this.goal = data.goal;
    this.checkpoints = (data.checkpoints || []).map(
      (c) => new Checkpoint(c.x, c.y)
    );

    const maxX = Math.max(
      ...this.platforms.map((p) => p.x + p.w),
      this.goal.x + 500
    );
    Game.worldW = maxX;

    this.projectiles = [];

    // Reset player position
    player.x = this.respawnX;
    player.y = this.respawnY;
    player.dx = 0;
    player.dy = 0;
  },

  // Get the display level number (accounting for loops)
  getDisplayLevel() {
    const total = Object.keys(LEVEL_REGISTRY).length || 1;
    return this.currentId + (this.loopCount || 0) * total;
  },

  // Set new respawn point
  setRespawn(x, y) {
    this.respawnX = x;
    this.respawnY = y; // Would be adjusted to stand on ground
    console.log("Checkpoint activated !");
  },

  update(dt) {
    this.coins.forEach((c) => c.update(dt));
    this.enemies.forEach((e) => e.update(dt, this));
    // Update projectiles and remove dead ones
    if (this.projectiles) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.update(dt, this);
        if (p.life <= 0) {
          this.projectiles.splice(i, 1);
        }
      }
    }
    this.spikes.forEach((s) => s.update(dt));
    this.springs.forEach((s) => s.update(dt));
    this.movingPlatforms.forEach((m) => m.update(dt));
    this.checkpoints.forEach((c) => c.update(dt));
  },

  // Draw level elements
  draw() {
    ctx.save();

    // 1. Background
    ctx.translate(-Game.camX, 0);

    // 2. Platforms
    for (const p of this.platforms) {
      // --- ONE WAY ---
      if (p.oneWay) {
        if (oneWayPlatformImg.complete && oneWayPlatformImg.naturalWidth) {
          ctx.drawImage(oneWayPlatformImg, p.x, p.y, p.w, p.h);
        } else {
          ctx.fillStyle = "#87CEFA";
          ctx.fillRect(p.x, p.y, p.w, p.h);
        }
      }

      // Wall platforms (vertical)
      else {
        if (wallPattern) {
          ctx.fillStyle = wallPattern;
          ctx.fillRect(p.x, p.y, p.w, p.h);
        } else {
          ctx.fillStyle = "#000000";
          ctx.fillRect(p.x, p.y, p.w, p.h);
        }
      }
    }

    ctx.restore();

    // Entities
    this.movingPlatforms.forEach((m) => m.draw());
    this.coins.forEach((c) => c.draw());
    this.projectiles.forEach((p) => p.draw());
    this.enemies.forEach((e) => e.draw());
    this.spikes.forEach((s) => s.draw());
    this.springs.forEach((s) => s.draw());
    this.checkpoints.forEach((c) => c.draw());

    // Goal(star)
    if (this.goal) {
      const gx = this.goal.x - Game.camX;
      if (goalStarImg.complete && goalStarImg.naturalWidth) {
        ctx.drawImage(goalStarImg, gx, this.goal.y, this.goal.w, this.goal.h);
      } else {
        ctx.fillStyle = "#f2c14e";
        ctx.fillRect(gx, this.goal.y, this.goal.w, this.goal.h);
      }
    }
  },

  // Navigate to the next level
  next() {
    const entries = Object.entries(LEVEL_REGISTRY).sort(
      ([a], [b]) => Number(a) - Number(b)
    );
    const currentIdx = entries.findIndex(
      ([id]) => Number(id) === this.currentId
    );
    const nextEntry = entries[currentIdx + 1];
    if (nextEntry) {
      this.init(nextEntry[1]);
      return;
    }
    // Infinite mode : loop back to level 1 with increased difficulty
    this.loopCount += 1;
    const firstEntry = entries[0];
    if (firstEntry) {
      this.init(firstEntry[1]);
      return;
    }
    end(true); // fallback
  },
};
