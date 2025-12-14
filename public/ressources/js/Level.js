/* ===========================
   SUPER RIJODA - LEVEL MANAGER
   =========================== */

// --- DONNÉES DU NIVEAU 1 (Intro) ---
const Level1Data = {
  id: 1,
  background: '#FFFFFF', // Fond blanc comme sur le mockup
  platforms: [
    { x: 0,   y: 400, w: 200, h: 140 }, // Départ
    { x: 300, y: 450, w: 150, h: 90  }, // Île milieu
    { x: 550, y: 350, w: 150, h: 190 }, // Île haute
    { x: 720, y: 300, w: 100, h: 20  }, // Flottante
    { x: 850, y: 400, w: 110, h: 140 }  // Fin
  ],
  coins:   [{x:360, y:410}, {x:760, y:260}],
  enemies: [{x:600, y:280, type:'patrol', dist:80},
            { x: 600, y: 100, type: 'bat', dist: 80 }],
  goal:    {x:900, y:350, w:40, h:40}
};

// --- DONNÉES DU NIVEAU 2 (Verticalité + Ressorts) ---
const Level2Data = {
  id: 2,
  background: '#FFFFFF',
  platforms: [
    // Sol de départ (Noir - Solide)
    { x: 0, y: 450, w: 200, h: 90 },

    // LES ESCALIERS BLEUS (Transparents -> oneWay: true)
    { x: 100, y: 350, w: 80, h: 20, oneWay: true },
    { x: 200, y: 280, w: 80, h: 20, oneWay: true },
    { x: 200, y: 200, w: 80, h: 20, oneWay: true },

    // Plateforme Haute (Noire - Solide)
    { x: 300, y: 150, w: 200, h: 40 },

    // Descente Bleue
    { x: 550, y: 220, w: 80, h: 20, oneWay: true },
    { x: 650, y: 300, w: 80, h: 20, oneWay: true },
   
    // Île Bas Droite (Avant le trou)
    { x: 750, y: 450, w: 150, h: 90 },

    // Île de Fin
    { x: 950, y: 250, w: 100, h: 290 }
  ],
  
  // NOUVEAU : Plateformes mobiles
  movingPlatforms: [
    // x, y, w, h, rangeX, rangeY, speed
    // Ici elle est à x=900, elle bouge de 0 en X et de 150 en Y (Haut/Bas)
    { x: 880, y: 320, w: 60, h: 20, rangeX: 0, rangeY: 90, speed: 2 } 
  ],

  coins:   [{x:380, y:110}, {x:800, y:410}],
  enemies: [{x:350, y:80, type:'patrol', dist:100},
            { x: 900, y: 180, type: 'bat', dist: 120 }],
  goal:    {x:970, y:200, w:40, h:40},
  
  // On supprime les ressorts (springs) car remplacés par la plateforme mobile
  springs: [] 
};

// --- DONNÉES DU NIVEAU 3 (Hardcore & Long) ---
const Level3Data = {
  id: 3,
  background: '#FFFFFF',


  // 1. LES PLATEFORMES (Structure)
  platforms: [
    // --- ZONE 1 : LE CHAMP DE PIQUES (Précision) ---
    { x: 0,   y: 450, w: 150, h: 190 }, // Départ plus haut
    
    // Piliers plus étroits que dans votre version précédente = plus dur
    { x: 200, y: 350, w: 50, h: 190 }, 
    { x: 350, y: 300, w: 50, h: 240 }, 
    { x: 500, y: 350, w: 50, h: 190 }, 

    // --- ZONE 2 : LE MUR VERTICAL (Endurance) ---
    { x: 650, y: 400, w: 150, h: 140 }, // Base du mur
    
    // Ascension en zigzag avec des oneWay
    { x: 800, y: 300, w: 80, h: 20, oneWay: true },
    { x: 650, y: 200, w: 80, h: 20, oneWay: true }, 
    { x: 800, y: 100, w: 80, h: 20, oneWay: true },

    // Le Sommet (très haut)
    { x: 950, y: 80, w: 300, h: 40 }, 

    // --- ZONE 3 : LE GOUFFRE FINAL (Timing) ---
    // Juste une petite plateforme d'arrivée très loin
    { x: 2200, y: 250, w: 150, h: 40 }, 
  ],

  // 2. LES DANGERS (Piques partout)
  spikes: [
    // Zone 1 : Remplir les trous entre les piliers
    { x: 150, y: 510 }, { x: 180, y: 510 },
    { x: 250, y: 510 }, { x: 280, y: 510 }, { x: 310, y: 510 },
    { x: 400, y: 510 }, { x: 430, y: 510 }, { x: 460, y: 510 },
    { x: 550, y: 510 }, { x: 580, y: 510 }, { x: 610, y: 510 },
  ],

  // 3. LES PLATEFORMES MOBILES (Rapides et dangereuses)
  movingPlatforms: [
    // Pour traverser le gouffre final. Elles sont plus rapides maintenant (speed 2.5 et 3)
    { x: 1300, y: 150, w: 80, h: 20, rangeX: 150, rangeY: 50, speed: 2.5 }, // Mouvement diagonal !
    { x: 1650, y: 250, w: 80, h: 20, rangeX: 0, rangeY: 120, speed: 3.0 },  // Ascenseur rapide
    { x: 1900, y: 200, w: 80, h: 20, rangeX: 150, rangeY: 0, speed: 2.5 }   // Dernier saut horizontal
  ],

  // 4. LES ENNEMIS (Placés stratégiquement)
  enemies: [
    // Sur le pilier du milieu (très gênant pour sauter)
    { x: 375, y: 150, type: 'patrol', dist: 20 },
    
    // Pendant l'escalade du mur
    { x: 810, y: 60, type: 'patrol', dist: 60 },

    // Au sommet, pour vous accueillir après l'escalade
    { x: 1000, y: 40, type: 'patrol', dist: 150 },

    { x: 1450, y: 100, type: 'bat', dist: 120 }, 
    
    { x: 1800, y: 150, type: 'bat', dist: 80 }
  ],

  coins: [
    {x: 375, y: 220}, // Au dessus de l'ennemi du pilier (risque/récompense)
    {x: 690, y: 160}, // Pendant l'escalade
    {x: 1340, y: 110}, // Sur la 1ère plateforme mobile
    {x: 1940, y: 160}  // Sur la dernière plateforme mobile
  ],

  checkpoints: [
    { x: 670, y: 350 }, // Avant le grand mur
    { x: 1100, y: 30 }  // Au sommet, avant le gouffre final
  ],

  goal: { x: 2250, y: 200, w: 40, h: 40 }
};

// --- ASSETS ---
const goalStarImg = new Image();
goalStarImg.src = "/ressources/images/mockup/star.png";


// --- GESTIONNAIRE DE NIVEAU ---
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
  bgColor: '#e3a576',

  // Charge un niveau depuis les données (Data)
  init(data) {
    this.currentId = data.id;

    this.respawnX = 60;
    this.respawnY = 90;

    // Charge les plateformes classiques
    this.platforms = data.platforms; 

    // Charge les plateformes mobiles (Nouveau)
    this.movingPlatforms = (data.movingPlatforms || []).map(m => 
        new MovingPlatform(m.x, m.y, m.w, m.h, m.rangeX, m.rangeY, m.speed)
    );

    this.coins = data.coins.map(c => new Coin(c.x, c.y));
    this.enemies = (data.enemies || []).map(e => {
      if (e.type === 'bat') {
           return new Bat(e.x, e.y, e.dist);
       }

       const en = new Enemy(e.x, e.y);
       if(e.type === 'patrol') en.dist = e.dist; 
       return en;
    });
    this.spikes = (data.spikes || []).map(s => new Spike(s.x, s.y));
    this.springs = (data.springs || []).map(s => new Spring(s.x, s.y));
    this.goal = data.goal;
    this.checkpoints = (data.checkpoints || []).map(c => new Checkpoint(c.x, c.y));

    const maxX = Math.max(
        ...this.platforms.map(p => p.x + p.w), 
        this.goal.x + 500
    );
    Game.worldW = maxX;

    this.projectiles = [];
    
    // Reset Joueur
    player.x = this.respawnX; 
    player.y = this.respawnY; 
    player.dx = 0; player.dy = 0;
  },


  setRespawn(x, y) {
    this.respawnX = x;
    this.respawnY = y; // On garde la hauteur de la lanterne (ou un peu au-dessus)
    console.log("Checkpoint activated !");
  },

  update(dt) {
    this.coins.forEach(c => c.update(dt));
    this.enemies.forEach(e => e.update(dt, this)); 
    if (this.projectiles) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, this);
            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    this.spikes.forEach(s => s.update(dt));
    this.springs.forEach(s => s.update(dt));
    this.movingPlatforms.forEach(m => m.update(dt));
    this.checkpoints.forEach(c => c.update(dt));
  },

  draw() {

    // Plateformes
    for(const p of this.platforms) {
      const px = p.x - Game.camX;
      ctx.fillStyle = p.oneWay ? '#87CEFA' : '#000000';
      ctx.fillRect(px, p.y, p.w, p.h);
    }

    // Entités
    this.movingPlatforms.forEach(m => m.draw());
    this.coins.forEach(c => c.draw());
    this.projectiles.forEach(p => p.draw());
    this.enemies.forEach(e => e.draw());
    this.spikes.forEach(s => s.draw());
    this.springs.forEach(s => s.draw());
    this.checkpoints.forEach(c => c.draw());

    // Objectif (Étoile jaune)
    if(this.goal) {
       const gx = this.goal.x - Game.camX;
       if (goalStarImg.complete && goalStarImg.naturalWidth) {
         ctx.drawImage(goalStarImg, gx, this.goal.y, this.goal.w, this.goal.h);
       } else {
         ctx.fillStyle = '#f2c14e'; // fallback jaune
         ctx.fillRect(gx, this.goal.y, this.goal.w, this.goal.h);
       }
    }
  },

  // Passage au niveau suivant
  next() {
    if (this.currentId === 1) this.init(Level2Data);
    else if (this.currentId === 2) this.init(Level3Data);
    else {
      end(true); // Fin du jeu, victoire !
    }
  }
};
