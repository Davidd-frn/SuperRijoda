import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Description from "./Description";
import Sketch from "./Sketch";
import Mockup from "./Mockup";
import Flow from "./Flow";
import Logbook from "./Logbook";
import GameMenu from "./GameMenu";
import Commands from "./Commands";
import GamePlay from "./GamePlay";
import { unloadScripts } from "./lib/loadScripts";

function App() {
  const location = useLocation();
  const hideChrome = ["/game", "/commands", "/play"].some((path) =>
    location.pathname.startsWith(path)
  );

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

  const MENU_SCRIPTS = ["/ressources/js/geo.js", "/ressources/js/script.js"];
  const COMMAND_SCRIPTS = ["/ressources/js/commands.js"];

  // Stop any stray audio on route change (e.g., BGM)
  useEffect(() => {
    const audios = document.querySelectorAll("audio");
    audios.forEach((a) => a.pause());

    if (location.pathname !== "/play") {
      window.__stopGameLoop = true;
      if (window.Game) {
        try {
          window.Game.running = false;
          if (typeof window.Game.stopBGM === "function") {
            window.Game.stopBGM();
          } else if (window.Game.bgmElement) {
            window.Game.bgmElement.pause();
            window.Game.bgmElement.currentTime = 0;
          }
          window.Game = undefined;
        } catch (e) {
          // ignore cleanup errors
        }
      }
      if (window.__bgmElement) {
        try {
          window.__bgmElement.pause();
          window.__bgmElement.currentTime = 0;
        } catch (e) {
          // ignore
        }
      }
      unloadScripts([...GAME_SCRIPTS, ...MENU_SCRIPTS, ...COMMAND_SCRIPTS]);
    }
  }, [location.pathname]);

  return (
    <>
      {!hideChrome && <Header />}

      <Routes>
        <Route path="/" element={<Navigate to="/description" replace />} />
        <Route path="/description" element={<Description />} />
        <Route path="/sketch" element={<Sketch />} />
        <Route path="/mockup" element={<Mockup />} />
        <Route path="/flow" element={<Flow />} />
        <Route path="/logbook" element={<Logbook />} />
        <Route path="/game" element={<GameMenu />} />
        <Route path="/commands" element={<Commands />} />
        <Route path="/play" element={<GamePlay />} />
        <Route
          path="/loadingScreen.html"
          element={<Navigate to="/game" replace />}
        />
        <Route path="/game.html" element={<Navigate to="/play" replace />} />
        <Route
          path="/commands.html"
          element={<Navigate to="/commands" replace />}
        />
      </Routes>

      {!hideChrome && <Footer />}
    </>
  );
}

export default App;
