/* ===========================
   SUPER RIJODA - GAME ENGINE (CORE)
   =========================== */

// ------- Player + camera -------
// On place le joueur temporairement, Level.init le replacera correctement
const player = new Player(60, 380);


// --- FONCTION DÉCOR PARALLAXE ---
function drawParallaxBackground() {
    // 1. LE CIEL (Coucher de soleil impérial)
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#4b1d1d");   // Rouge sombre/Bordeaux en haut
    grad.addColorStop(0.4, "#b84328"); // Rouge brique
    grad.addColorStop(1, "#f4e4bc");   // Beige "Papier de riz" en bas
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. LE SOLEIL ROUGE (Symbole classique)
    // Il descend légèrement avec la caméra pour l'effet de profondeur
    const sunX = 600 - (Game.camX * 0.02); 
    ctx.fillStyle = "rgba(200, 50, 50, 0.8)"; // Rouge sang un peu transparent
    ctx.beginPath();
    ctx.arc(sunX, 150, 60, 0, Math.PI * 2);
    ctx.fill();

    // 3. LES MONTAGNES LOINTAINES (Brumeuses)
    ctx.fillStyle = "rgba(80, 40, 40, 0.3)"; // Couleur rouille très transparente
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width; i += 10) {
        // Formule mathématique pour des montagnes douces
        const h = 150 + Math.sin(i * 0.01 + Game.camX * 0.01) * 50 + Math.cos(i * 0.03) * 20;
        ctx.lineTo(i, canvas.height - h);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // 4. LE DÉCOR "SILHOUETTE" (Pagodes et Montagnes proches)
    // C'est la couche la plus importante (noire/sombre)
    ctx.fillStyle = "#2c1e1e"; // Marron très foncé presque noir
    
    // On dessine des formes basées sur la position de la caméra
    // On boucle sur la largeur visible + une marge
    const startX = Math.floor(Game.camX / 100) * 100;
    const endX = startX + canvas.width + 200;

    for (let x = startX; x < endX; x += 100) {
        // On utilise une fonction "pseudo-aléatoire" basée sur X
        // Cela permet que le décor soit toujours le même au même endroit
        const randomHeight = Math.abs(Math.sin(x * 999)); 
        
        // Position écran
        const screenX = x - (Game.camX * 0.5); // Parallaxe 0.5

        // Une fois sur 5 (environ), on dessine une PAGODE au lieu d'une montagne
        if (randomHeight > 0.85) {
            drawPagoda(ctx, screenX, canvas.height - 50);
        } else {
            // Sinon, une petite colline pointue (style Karst chinois)
            const hillH = 50 + randomHeight * 100;
            ctx.beginPath();
            ctx.moveTo(screenX - 60, canvas.height);
            ctx.quadraticCurveTo(screenX, canvas.height - hillH, screenX + 60, canvas.height);
            ctx.fill();
        }
    }
}


function drawPagoda(ctx, x, baseY) {
    const w = 40;
    const roofH = 15;
    const floorH = 20;
    
    // On dessine 3 étages
    for(let i=0; i<3; i++) {
        const currentY = baseY - (i * floorH);
        
        // Le mur
        ctx.fillRect(x - w/2 + (i*5), currentY - floorH, w - (i*10), floorH);
        
        // Le toit courbé
        ctx.beginPath();
        ctx.moveTo(x - w + (i*5), currentY - floorH); // Gauche toit
        ctx.lineTo(x + w - (i*5), currentY - floorH); // Droite toit
        ctx.lineTo(x, currentY - floorH - roofH);     // Pointe toit
        ctx.fill();
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
  if (isTrainingMode) {
    trainingLevel.update(dt);
  } else {
    Level.update(dt);
  }

  // 3. Mettre à jour la caméra
  updateCamera();

  // 4. Vérifier la Victoire (Toucher l'étoile)
  if (Level.goal && AABB(player.rect(), Level.goal)) {
      console.log("Niveau terminé !");
      Level.next(); // Charge le niveau suivant
      
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
