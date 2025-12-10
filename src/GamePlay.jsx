import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/game.css";
import { loadScriptsSequential, unloadScripts } from "./lib/loadScripts";

const GAME_SCRIPTS = [
  "/ressources/js/config.js",
  "/ressources/js/ui.js",
  "/ressources/js/Entity.js",
  "/ressources/js/MovingPlatform.js",
  "/ressources/js/Particle.js",
  "/ressources/js/Checkpoint.js",
  "/ressources/js/Player.js",
  "/ressources/js/Enemy.js",
  "/ressources/js/Bat.js",
  "/ressources/js/Spike.js",
  "/ressources/js/Spring.js",
  "/ressources/js/Level.js",
  "/ressources/js/game.js",
];

function GamePlay() {
  const navigate = useNavigate();

  const stopGameAudio = () => {
    if (window.Game) {
      window.Game.running = false;
      if (typeof window.Game.stopBGM === "function") {
        window.Game.stopBGM();
      }
    }
    const audioEls = document.querySelectorAll("audio");
    audioEls.forEach((a) => a.pause());
  };

  const cleanup = () => {
    document.body.classList.remove("game-body");
    stopGameAudio();
    window.__stopGameLoop = true;
    unloadScripts(GAME_SCRIPTS);
  };

  useEffect(() => {
    // ensure previous loops/audio are stopped before starting fresh
    if (window.Game && typeof window.Game.stopBGM === "function") {
      window.Game.stopBGM();
    }
    window.__stopGameLoop = false;
    document.body.classList.add("game-body");
    loadScriptsSequential(GAME_SCRIPTS, { forceReload: true }).catch((err) =>
      console.error(err)
    );
    return () => {
      cleanup();
    };
  }, []);

  const handleBack = (e) => {
    e.preventDefault();
    cleanup();
    navigate("/game");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        className="backBtn secondary"
        style={{ position: "absolute", top: 16, left: 16 }}
      >
        Back
      </button>

      <main className="stage">
        <div id="game-wrapper">
          <canvas id="game" width="960" height="540"></canvas>

          <div className="hud">
            <div className="hud-item">
              <span className="hud-label">SCORE</span>
              <span id="score">0</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">TIME</span>
              <span id="time">0</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">LIVES</span>
              <span id="lives">⚘⚘⚘</span>
            </div>
          </div>

          <div id="pauseOverlay" className="overlay" hidden>
            <div className="modal-box pause">
              <h1>PAUSE</h1>
              <button id="resumeBtn" className="btn primary">
                RESUME
              </button>
            </div>
          </div>

          <div id="gameOver" className="overlay" hidden>
            <div className="modal-box lose">
              <h1 className="title-lose">GAME OVER</h1>
              <p>The samurai has died...</p>
              <div className="score-box">
                <span>FINAL SCORE</span>
                <span id="finalScore" className="big-number">
                  0
                </span>
              </div>
              <button id="retryBtn" className="btn danger">
                TRY AGAIN
              </button>
            </div>
          </div>

          <div id="winScreen" className="overlay" hidden>
            <div className="modal-box win">
              <h1 className="title-win">VICTORY!</h1>
              <p>A legend was born!</p>
              <div className="score-box">
                <span>TOTAL SCORE</span>
                <span id="winScore" className="big-number">
                  0
                </span>
              </div>
              <button id="winMenuBtn" className="btn success">
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default GamePlay;
