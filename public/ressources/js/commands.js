const keyCards = document.querySelectorAll('.key-card');
const lastKeyDisplay = document.getElementById('lastKey');

function setKeyActive(code, isActive) {
  const card = document.querySelector(`.key-card[data-key="${code}"]`);
  if (!card) return;
  card.classList.toggle('active', isActive);
}

window.addEventListener('keydown', (e) => {
  setKeyActive(e.code, true);
  if (lastKeyDisplay) {
    lastKeyDisplay.textContent = e.code;
  }
});

window.addEventListener('keyup', (e) => {
  setKeyActive(e.code, false);
});
