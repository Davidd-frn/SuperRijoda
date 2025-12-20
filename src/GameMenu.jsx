import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import "./css/game.css";
import { loadScriptsSequential, unloadScripts } from "./lib/loadScripts";

function GameMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const stopAllAudio = () => {
    window.__stopGameLoop = true;
    if (window.Game) {
      window.Game.running = false;
      if (typeof window.Game.stopBGM === "function") {
        window.Game.stopBGM();
      } else if (window.Game.bgmElement) {
        window.Game.bgmElement.pause();
        window.Game.bgmElement.currentTime = 0;
      }
      window.Game = undefined;
    }
    const audioEls = document.querySelectorAll("audio");
    audioEls.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    if (window.__bgmElement) {
      window.__bgmElement.pause();
      window.__bgmElement.currentTime = 0;
    }
    unloadScripts(["/ressources/js/geo.js", "/ressources/js/script.js"]);
  };

  const handleBackHome = (e) => {
    e.preventDefault();
    stopAllAudio();
    navigate("/description");
  };

  useEffect(() => {
    stopAllAudio();
    document.body.classList.add("game-body");
    loadScriptsSequential(["/ressources/js/geo.js", "/ressources/js/script.js"])
      .then(() => {
        if (location.state && location.state.autoOpen) {
          const selectModal = document.getElementById("characterSelect");
          if (selectModal) {
            selectModal.hidden = false;
          }
        }
      })
      .catch((err) => console.error(err));

    return () => {
      document.body.classList.remove("game-body");
    };
  }, [location]);

  return (
    <div className="game-shell">
      <div>
        <button
          type="button"
          onClick={handleBackHome}
          className="backBtn secondary"
        >
          Back to Homepage
        </button>
      </div>

      <div className="button-container">
        <button id="startGameBtn" type="button" className="btn">
          Start Game
        </button>
        <button id="leaderboardBtn" type="button" className="btn secondary">
          Leaderboard
        </button>
        <Link to="/commands" className="btn secondary">
          Commands
        </Link>
      </div>

      {/* Character selection overlay */}
      <div id="characterSelect" className="overlay" hidden>
        <form id="characterForm" className="modal-box select">
          <h1>Choose Your Character</h1>
          <p className="select-subtitle">
            Pick a style, then drag &amp; drop it into the slot. Set your name
            first.
          </p>

          <div className="identity-block">
            <label className="identity-label" htmlFor="playerName">
              Username
            </label>
            <div className="identity-row">
              <input
                id="playerName"
                name="playerName"
                type="text"
                inputMode="text"
                autoComplete="nickname"
                minLength="3"
                maxLength="20"
                pattern="^[A-Za-z0-9 _-]{3,20}$"
                placeholder="Your name"
                required
              />
              <img
                id="geoFlag"
                className="geo-flag"
                hidden
                width="24"
                height="18"
                alt="Country flag"
                title="Country flag"
              />
            </div>
            <div className="geo-row">
              <div id="geoStatus" className="geo-status">
                Detecting location...
              </div>
            </div>
          </div>

          <div className="character-grid">
            <button
              className="character-card"
              data-character="samurai"
              draggable="true"
              data-preview="/ressources/images/mockup/RoninPicture.png"
              data-filter="none"
              data-cols="4"
              data-rows="3"
            >
              <div className="character-art">
                <img
                  src="/ressources/images/mockup/RoninPicture.png"
                  alt="Samurai preview"
                />
                <span className="swatch neutral"></span>
              </div>
              <div className="character-meta">
                <span className="character-name">Samurai</span>
                <small>Balanced all-rounder.</small>
              </div>
            </button>

            <button
              className="character-card"
              data-character="women"
              draggable="true"
              data-preview="/ressources/images/mockup/Women.png"
              data-cols="4"
              data-rows="3"
            >
              <div className="character-art">
                <img
                  src="/ressources/images/mockup/Women.png"
                  alt="Women warrior preview"
                />
                <span className="swatch crimson"></span>
              </div>
              <div className="character-meta">
                <span className="character-name">Women warrior</span>
                <small>Stronger attacks, bold hue.</small>
              </div>
            </button>

            <button
              className="character-card"
              data-character="shadow"
              draggable="true"
              data-preview="/ressources/images/mockup/ShadowShinobi.png"
              data-cols="4"
              data-rows="3"
            >
              <div className="character-art">
                <img
                  src="/ressources/images/mockup/ShadowShinobi.png"
                  alt="Shadow Shinobi preview"
                />
                <span className="swatch shadow"></span>
              </div>
              <div className="character-meta">
                <span className="character-name">Shadow Shinobi</span>
                <small>Lighter build, stealth vibe.</small>
              </div>
            </button>
          </div>

          <div className="drop-area">
            <div className="drop-label">Drag a card into the drop slot</div>
            <div
              id="characterDropSlot"
              className="drop-slot"
              aria-live="polite"
              tabIndex="0"
            >
              Drop character here
            </div>
            <div
              id="characterDropSelected"
              className="drop-selected"
              hidden
            ></div>
            <div id="characterPreview" className="drop-preview" hidden>
              <div id="characterPreviewFrame" className="frame-preview"></div>
              <div className="drop-preview-label">
                <span id="characterPreviewName"></span>
              </div>
            </div>
            <div
              id="characterSelectionError"
              className="form-error"
              role="alert"
              hidden
            ></div>
          </div>

          <div className="character-actions">
            <button
              id="confirmCharacter"
              className="btn primary disabled"
              type="submit"
              disabled
            >
              Play
            </button>
            <button
              id="closeCharacterSelect"
              className="btn secondary"
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Leaderboard Modal */}
      <div id="leaderboardModal" className="overlay" hidden>
        <div className="modal-box select">
          <h1>Leaderboard</h1>
          <div id="leaderboardList" className="leaderboard-list"></div>
          <button id="leaderboardClose" className="btn secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameMenu;
