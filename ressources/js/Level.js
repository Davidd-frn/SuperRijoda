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
  enemies: [{x:600, y:280, type:'patrol', dist:80}],
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
  enemies: [{x:350, y:80, type:'patrol', dist:100}],
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
    // --- ZONE 1 : LE DÉPART & LES PIQUES ---
    { x: 0,   y: 400, w: 200, h: 140 }, // Zone de départ
    
    // Petits piliers entre les piques (Sauts précis requis)
    { x: 250, y: 380, w: 60, h: 160 }, 
    { x: 400, y: 320, w: 60, h: 220 }, 
    { x: 550, y: 380, w: 60, h: 160 }, 

    // --- ZONE 2 : LE MUR VERTICAL ---
    // Base du mur
    { x: 700, y: 450, w: 150, h: 90 },
    
    // Escaliers flottants (OneWay) pour monter
    { x: 850, y: 350, w: 80, h: 20, oneWay: true },
    { x: 700, y: 250, w: 80, h: 20, oneWay: true }, // Retour vers la gauche pour monter
    { x: 850, y: 150, w: 80, h: 20, oneWay: true }, // Retour droite

    // Le Sommet du Mur (Très haut)
    { x: 1000, y: 150, w: 400, h: 40 }, // Longue plateforme haute avec ennemis

    // --- ZONE 3 : LA DESCENTE INFERNALE ---
    // Il faut redescendre sur des petites plateformes
    { x: 1500, y: 250, w: 80, h: 20, oneWay: true },
    { x: 1650, y: 350, w: 80, h: 20, oneWay: true },

    // --- ZONE 4 : LE GOUFFRE FINAL (Moving Platforms only) ---
    // Pas de sol ici, juste le vide mortel
    { x: 2400, y: 300, w: 200, h: 40 }, // L'île de l'étoile (La fin)
  ],

  // 2. LES DANGERS (Piques)
  spikes: [
    // Au sol dans la Zone 1 (Entre les piliers)
    // Si tu rates ton saut -> Piqué !
    { x: 200, y: 510 }, { x: 310, y: 510 }, { x: 340, y: 510 },
    { x: 460, y: 510 }, { x: 490, y: 510 }, { x: 610, y: 510 },
    
    // Piques sournoises sur le grand mur (Zone 2)
    // Si tu rates la plateforme mobile, tu tombes dessus
    { x: 750, y: 420 }, { x: 780, y: 420 }
  ],

  // 3. LES PLATEFORMES MOBILES (Le vrai challenge)
  movingPlatforms: [
    // Ascenseur pour atteindre le sommet du mur (Zone 2)
    // Monte et descend sur une grande distance
    { x: 600, y: 400, w: 80, h: 20, rangeX: 0, rangeY: 180, speed: 1.5 },

    // Les plateformes horizontales pour traverser le gouffre final (Zone 4)
    // Elles font des aller-retours au dessus du vide
    { x: 1800, y: 400, w: 80, h: 20, rangeX: 100, rangeY: 0, speed: 2 },
    { x: 2100, y: 300, w: 80, h: 20, rangeX: 0, rangeY: 100, speed: 2.5 } // Celle-ci monte et descend vite !
  ],

  // 4. LES ENNEMIS
  enemies: [
    // Un ennemi sur le premier pilier (dur à esquiver car peu de place)
    { x: 410, y: 250, type: 'patrol', dist: 40 },
    
    // Deux ennemis sur le grand mur en haut (Zone 2)
    { x: 1050, y: 110, type: 'patrol', dist: 100 },
    { x: 1250, y: 110, type: 'patrol', dist: 100 }
  ],

  // 5. LES PIÈCES (Pour guider le joueur)
  coins: [
    {x: 280, y: 340}, {x: 580, y: 340}, // Zone 1
    {x: 890, y: 110}, // Sommet escalier
    {x: 1200, y: 110}, // Milieu mur
    {x: 1840, y: 360}, // Sur la plateforme mobile 1
    {x: 2140, y: 260}  // Sur la plateforme mobile 2
  ],

  // 6. Checkpoint
  checkpoints: [
    // CHECKPOINT 1 : Juste au pied du grand mur.
    // Si on tombe pendant l'escalade, on reprend ici (pas besoin de refaire les piliers).
    { x: 720, y: 390 }, 

    // CHECKPOINT 2 : Tout en haut, avant de sauter dans le vide.
    // C'est le "Saut de la Foi". Si on rate la plateforme mobile, on réapparaît juste en haut.
    { x: 1350, y: 90 }
  ],

  // 7. L'OBJECTIF (Très loin)
  goal: { x: 2500, y: 260, w: 40, h: 40 }
};


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
  respawnY: 300,
  goal: null,
  currentId: 1,
  bgColor: '#e3a576',

  // Charge un niveau depuis les données (Data)
  init(data) {
    this.currentId = data.id;

    this.respawnX = 60;
    this.respawnY = 300;

    // Charge les plateformes classiques
    this.platforms = data.platforms; 

    // Charge les plateformes mobiles (Nouveau)
    this.movingPlatforms = (data.movingPlatforms || []).map(m => 
        new MovingPlatform(m.x, m.y, m.w, m.h, m.rangeX, m.rangeY, m.speed)
    );

    this.coins = data.coins.map(c => new Coin(c.x, c.y));
    this.enemies = (data.enemies || []).map(e => {
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
    this.enemies.forEach(e => e.update(dt, this)); // On passe 'this' (Level) pour les collisions
    this.spikes.forEach(s => s.update(dt));
    this.springs.forEach(s => s.update(dt));
    this.movingPlatforms.forEach(m => m.update(dt));
    this.checkpoints.forEach(c => c.update(dt));
  },

  draw() {

    // Plateformes (Noir)
    ctx.fillStyle = '#000000';
    for(const p of this.platforms) {
      ctx.fillStyle = p.oneWay ? '#87CEFA' : '#000000';
      ctx.fillRect(p.x - Game.camX, p.y, p.w, p.h);
    }

    // Entités
    this.movingPlatforms.forEach(m => m.draw());
    this.coins.forEach(c => c.draw());
    this.enemies.forEach(e => e.draw());
    this.spikes.forEach(s => s.draw());
    this.springs.forEach(s => s.draw());
    this.checkpoints.forEach(c => c.draw());

    // Objectif (Étoile jaune)
    if(this.goal) {
       ctx.fillStyle = '#f2c14e'; // Jaune
       // Tu peux dessiner une image ici si tu as une étoile.png
       ctx.fillRect(this.goal.x - Game.camX, this.goal.y, this.goal.w, this.goal.h);
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