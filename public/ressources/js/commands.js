(() => {
  if (window.__commandsListenersAttached) return;
  window.__commandsListenersAttached = true;

  const getLastKeyDisplay = () => document.getElementById("lastKey");

  // Function to set a key card as active or inactive
  function setKeyActive(code, isActive) {
    const card = document.querySelector(
      `.key-card[data-key="${code}"], .key-card[data-alt="${code}"]`
    );
    if (!card) return;
    card.classList.toggle("active", isActive);
  }

  // Event listeners for keydown and keyup to update key card states
  window.addEventListener("keydown", (e) => {
    setKeyActive(e.code, true);
    const lastKeyDisplay = getLastKeyDisplay();
    if (lastKeyDisplay) {
      lastKeyDisplay.textContent = e.code;
    }
  });

  // Keyup event to deactivate the key card
  window.addEventListener("keyup", (e) => {
    setKeyActive(e.code, false);
  });
})();
