import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/game.css";
import { loadScriptsSequential } from "./lib/loadScripts";

function Commands() {
  useEffect(() => {
    document.body.classList.add("game-body");
    loadScriptsSequential(["/ressources/js/commands.js"]).catch((err) =>
      console.error(err)
    );
    return () => {
      document.body.classList.remove("game-body");
    };
  }, []);

  return (
    <>
      <Link to="/game" className="backBtn secondary commands-back">
        ← Back
      </Link>

      <main className="commands-page">
        <section className="commands-panel">
          <h1 className="commands-title">Commands</h1>
          <p className="commands-subtitle">
            Learn how to control Rijoda before you enter the first level. Press
            the keys on your keyboard and see them light up below.
          </p>

          <div className="keys-grid">
            <div className="key-card" data-key="ArrowLeft">
              <div className="key-label">←</div>
              <div className="key-name">Move Left</div>
              <p className="key-desc">Hold to run towards the left.</p>
            </div>

            <div className="key-card" data-key="ArrowRight">
              <div className="key-label">→</div>
              <div className="key-name">Move Right</div>
              <p className="key-desc">Hold to run towards the right.</p>
            </div>

            <div className="key-card" data-key="Space">
              <div className="key-label long">Space</div>
              <div className="key-name">Jump</div>
              <p className="key-desc">
                Press to jump. Combine with arrows to clear gaps.
              </p>
            </div>

            <div className="key-card" data-key="KeyA">
              <div className="key-label">A</div>
              <div className="key-name">Attack</div>
              <p className="key-desc">Swing your katana to defeat enemies.</p>
            </div>

            <div className="key-card" data-key="KeyF">
              <div className="key-label">F</div>
              <div className="key-name">Throw</div>
              <p className="key-desc">Throw your shuriken to defeat enemies.</p>
            </div>

            <div className="key-card" data-key="KeyP">
              <div className="key-label">P</div>
              <div className="key-name">Pause</div>
              <p className="key-desc">Pause the game and take a break.</p>
            </div>

            <div className="key-card" data-key="Escape">
              <div className="key-label">Esc</div>
              <div className="key-name">Pause / Menu</div>
              <p className="key-desc">Open the pause overlay and options.</p>
            </div>
          </div>

          <div className="live-indicator">
            <span className="live-label">Last key pressed:</span>
            <span id="lastKey" className="live-key">
              None
            </span>
          </div>

          <div className="commands-actions">
            <Link 
              to="/game" 
              state={{ autoOpen: true }} 
              className="primary start-btn btn"
            >
              Select Character
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default Commands;
