/* ===========================
   SUPER RIJODA - GAME ENGINE (CORE)
   =========================== */


// CONFIGURATION DES FONDS D'ÉCRAN
const bgImages = []; 
// Liste de vos fichiers images. Ajoutez-en autant que vous avez de niveaux.
const bgFiles = [
    'ressources/images/background/BG-Lvl1.png', // Image pour le Niveau 1
    'ressources/images/background/BG-Lvl2.png', // Image pour le Niveau 2
    'ressources/images/background/BG-Lvl3.png'  // Image pour le Niveau 3
];

// Chargement automatique des images
bgFiles.forEach(file => {
    const img = new Image();
    img.src = file;
    bgImages.push(img);
});

// Variable pour suivre le niveau actuel (0 = premier niveau)
let currentLevelIndex = 0;


// ------- Player + camera -------
// On place le joueur temporairement, Level.init le replacera correctement
const player = new Player(60, 380);


// --- FONCTION DÉCOR PARALLAXE ---
function drawParallaxBackground() {
    const imgIndex = currentLevelIndex % bgImages.length;
    const bgToDraw = bgImages[imgIndex];

    // 2. Sécurité : Si l'image n'est pas chargée, fond noir
    if (!bgToDraw || !bgToDraw.complete) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // 3. Calcul de la position pour le défilement infini
    const parallaxSpeed = 0.5; // Vitesse de défilement (0.5 = 50% de la vitesse joueur)
    
    // On calcule le décalage X basé sur la caméra
    const xPos = -(Game.camX * parallaxSpeed) % bgToDraw.width;

    // 4. Dessin de l'image (Première copie)
    // On étire la hauteur (canvas.height) pour bien remplir l'écran
    ctx.drawImage(bgToDraw, xPos, 0, bgToDraw.width, canvas.height);

    // 5. Dessin de l'image (Deuxième copie pour combler le vide à droite)
    if (xPos + bgToDraw.width < canvas.width) {
        ctx.drawImage(bgToDraw, xPos + bgToDraw.width, 0, bgToDraw.width, canvas.height);
    }
}



function updateCamera() {
  // La caméra suit le joueur mais ne sort pas des limites du niveau (Game.worldW)
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
  
  // Calcul du Delta Time (dt) pour que le jeu ait la même vitesse partout
  const dt = Math.min((t - last) / 1000, 0.05);
  last = t;


  // Time 
  Game.time += dt;
  UI.time.textContent = Game.time.toFixed(2);


  // --- UPDATE (LOGIQUE) ---
  // Mise à jour des particules (Juste avant player.update)
  for (let i = Game.particles.length - 1; i >= 0; i--) {
      const p = Game.particles[i];
      p.update();
      if (p.life <= 0) {
          Game.particles.splice(i, 1); // Supprime la particule si elle est "morte"
      }
  }

  
  // 1. Mettre à jour le Joueur (Mouvements, Physique)
  player.update(dt, Level);

  // 2. Mettre à jour tout le niveau (Ennemis, Pièces, Piques, Ressorts)
  // C'est ici que Level.js fait tout le travail !
  Level.update(dt);

  // 3. Mettre à jour la caméra
  updateCamera();

  // 4. Vérifier la Victoire (Toucher l'étoile)
  if (Level.goal && AABB(player.rect(), Level.goal)) {
      Level.next(); // Charge le niveau suivant
      currentLevelIndex++;
      
      // On replace le joueur au début pour le prochain niveau
      player.x = 60; 
      player.y = 300; 
      player.dx = 0; 
      player.dy = 0;
  }

  // --- DRAW (DESSIN) ---
  drawParallaxBackground();
  Level.draw();
  player.draw();
  Game.particles.forEach(p => p.draw());

  // On boucle
  requestAnimationFrame(loop);
}

// --- DÉMARRAGE DU JEU ---

// 1. On charge les données du Premier Niveau
if (typeof Level1Data !== 'undefined') {
    Level.init(Level1Data);
} else {
    console.error("Erreur: Level1Data introuvable. Vérifiez l'ordre des scripts dans le HTML.");
}

// 2. On réinitialise l'interface
Game.resetHUD();

// 3. On lance la musique (peut être bloqué par le navigateur au début)
Game.startBGM(); 

// 4. C'est parti !
requestAnimationFrame(loop);
