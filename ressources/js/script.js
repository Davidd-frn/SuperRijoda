(() => {
  const startButton = document.getElementById("startGameBtn");
  const overlay = document.getElementById("characterSelect");
  const confirmBtn = document.getElementById("confirmCharacter");
  const closeBtn = document.getElementById("closeCharacterSelect");
  const characterCards = Array.from(
    document.querySelectorAll("[data-character]")
  );
  const dropSlot = document.getElementById("characterDropSlot");
  const dropSelected = document.getElementById("characterDropSelected");
  const previewBox = document.getElementById("characterPreview");
  const previewFrame = document.getElementById("characterPreviewFrame");
  const previewName = document.getElementById("characterPreviewName");
  const form = document.getElementById("characterForm");
  const nameInput = document.getElementById("playerName");
  const geoStatus = document.getElementById("geoStatus");
  const geoFlag = document.getElementById("geoFlag");
  const geoCountry = document.getElementById("geoCountry");
  const selectionError = document.getElementById("characterSelectionError");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const leaderboardModal = document.getElementById("leaderboardModal");
  const leaderboardList = document.getElementById("leaderboardList");
  const leaderboardClose = document.getElementById("leaderboardClose");

  const STORAGE_KEY = "selectedCharacter";
  const USERNAME_KEY = "playerName";
  const LEADERBOARD_KEY = "leaderboard";

  if (!startButton || !overlay) return;

  let selected = null;

  const hasName = () => Boolean(nameInput?.value.trim());

  const getLabelFor = (id) => {
    const card = characterCards.find((c) => c.dataset.character === id);
    return (
      card?.querySelector(".character-name")?.textContent?.trim() || id || ""
    );
  };

  const sanitizeText = (val, fallback = "") => {
    if (typeof val !== "string") return fallback;
    return val.replace(/[<>]/g, "").trim() || fallback;
  };

  const clearSelectionError = () => {
    if (selectionError) {
      selectionError.hidden = true;
      selectionError.textContent = "";
    }
    if (dropSlot) {
      dropSlot.setAttribute("aria-invalid", "false");
    }
  };

  const showSelectionError = (message) => {
    if (selectionError) {
      selectionError.hidden = false;
      selectionError.textContent = message;
    }
    if (dropSlot) {
      dropSlot.setAttribute("aria-invalid", "true");
    }
  };

  const updateConfirmState = () => {
    const ready = Boolean(selected) && hasName();
    if (confirmBtn) {
      confirmBtn.disabled = !ready;
      confirmBtn.classList.toggle("disabled", !ready);
    }
  };

  const updateDropSelected = () => {
    if (!dropSelected || !dropSlot) return;
    if (selected) {
      dropSelected.hidden = false;
      dropSelected.textContent = `Selected: ${getLabelFor(selected)}`;
    } else {
      dropSelected.hidden = true;
    }
  };

  const setSelected = (id) => {
    if (!id) return;
    selected = id;
    highlightSelection();
    updateDropSelected();
    updatePreview();
    clearSelectionError();
    updateConfirmState();
  };

  const updatePreview = () => {
    if (!previewBox || !previewFrame || !previewName) return;
    if (!selected) {
      previewBox.hidden = true;
      return;
    }
    const selectedCard = characterCards.find(
      (c) => c.dataset.character === selected
    );
    if (!selectedCard) {
      previewBox.hidden = true;
      return;
    }
    const src = selectedCard.dataset.preview;
    const filter = selectedCard.dataset.filter || "none";
    const cols = parseInt(selectedCard.dataset.cols || "1", 10);
    const rows = parseInt(selectedCard.dataset.rows || "1", 10);
    previewFrame.style.backgroundImage = `url(${src})`;
    previewFrame.style.filter = filter;
    previewName.textContent = getLabelFor(selected);
    previewBox.hidden = false;
  };

  const highlightSelection = () => {
    characterCards.forEach((card) => {
      const isActive = card.dataset.character === selected;
      card.classList.toggle("active", isActive);
      card.setAttribute("aria-pressed", isActive);
    });
  };

  const openOverlay = (event) => {
    event.preventDefault();
    overlay.hidden = false;
    form?.reset();
    selected = null;
    if (nameInput) {
      const storedName = localStorage.getItem(USERNAME_KEY) || "";
      nameInput.value = storedName;
    }
    clearSelectionError();
    if (window.Geo?.initCountryFlag) {
      window.Geo.initCountryFlag({
        statusEl: geoStatus,
        flagEl: geoFlag,
        countryEl: geoCountry,
      });
    }
    highlightSelection();
    updateDropSelected();
    updatePreview();
    updateConfirmState();
  };

  const closeOverlay = () => {
    overlay.hidden = true;
  };

  const renderLeaderboard = () => {
    if (!leaderboardList) return;
    let entries = [];
    try {
      entries = JSON.parse(localStorage.getItem("leaderboard")) || [];
    } catch (e) {
      entries = [];
    }
    if (!entries.length) {
      leaderboardList.innerHTML =
        '<div class="leaderboard-empty">No scores yet.</div>';
      return;
    }
    leaderboardList.innerHTML = entries
      .slice(0, 10)
      .map(
        (e, idx) => {
        // Formatage du temps : s il existe, formater à 2 décimales. Sinon, afficher --
          const timeDisplay = e.time ? `${e.time.toFixed(3)}s` : "--";
          // Construction de l'URL du drapeau à partir du countryCode (plus fiable que l'emoji)
          const flagUrl = e.countryCode 
            ? `https://flagcdn.com/24x18/${e.countryCode.toLowerCase()}.png` 
            : "";
            
          return `
            <div class="leaderboard-row">
              <div class="leaderboard-left">
                <span class="leaderboard-rank">#${idx + 1}</span>
                <img 
                  class="leaderboard-flag" 
                  src="${flagUrl}" 
                  alt="${e.countryCode || ""}" 
                  ${flagUrl ? "" : "hidden"} 
                />
                <span class="leaderboard-name">${e.name || "Anonymous"}</span>
              </div>
              <div class="leaderboard-right">
                <span class="leaderboard-score">${e.score ?? 0} pts</span>
                <span class="leaderboard-time">${timeDisplay}</span>
              </div>
            </div>`;
        }
      )
      .join("");
  };

  const renderLeaderboardSafe = () => {
    if (!leaderboardList) return;
    let entries = [];
    try {
      entries = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
    } catch (e) {
      entries = [];
    }
    leaderboardList.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "leaderboard-empty";
      empty.textContent = "No scores yet.";
      leaderboardList.appendChild(empty);
      return;
    }
    entries.slice(0, 10).forEach((e, idx) => {
      const row = document.createElement("div");
      row.className = "leaderboard-row";

      const left = document.createElement("div");
      left.className = "leaderboard-left";

      const rank = document.createElement("span");
      rank.className = "leaderboard-rank";
      rank.textContent = `#${idx + 1}`;
      left.appendChild(rank);

      const flagUrl = e.countryCode
        ? `https://flagcdn.com/24x18/${String(e.countryCode).toLowerCase()}.png`
        : "";
      const flag = document.createElement("img");
      flag.className = "leaderboard-flag";
      if (flagUrl) {
        flag.src = flagUrl;
        flag.alt = sanitizeText(e.countryCode, "");
      } else {
        flag.hidden = true;
      }
      left.appendChild(flag);

      const nameSpan = document.createElement("span");
      nameSpan.className = "leaderboard-name";
      nameSpan.textContent = sanitizeText(e.name, "Anonymous");
      left.appendChild(nameSpan);

      const right = document.createElement("div");
      right.className = "leaderboard-right";

      const scoreSpan = document.createElement("span");
      scoreSpan.className = "leaderboard-score";
      scoreSpan.textContent = `${Number(e.score) || 0} pts`;
      right.appendChild(scoreSpan);

      const timeSpan = document.createElement("span");
      timeSpan.className = "leaderboard-time";
      timeSpan.textContent =
        typeof e.time === "number" && isFinite(e.time)
          ? `${e.time.toFixed(3)}s`
          : "--";
      right.appendChild(timeSpan);

      row.appendChild(left);
      row.appendChild(right);
      leaderboardList.appendChild(row);
    });
  };

  characterCards.forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/plain", card.dataset.character);
      e.dataTransfer?.setDragImage(
        card,
        card.offsetWidth / 2,
        card.offsetHeight / 2
      );
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  if (dropSlot) {
    dropSlot.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropSlot.classList.add("active");
      e.dataTransfer.dropEffect = "copy";
    });

    dropSlot.addEventListener("dragleave", () => {
      dropSlot.classList.remove("active");
    });

    dropSlot.addEventListener("drop", (e) => {
      e.preventDefault();
      dropSlot.classList.remove("active");
      const charId = e.dataTransfer?.getData("text/plain");
      if (
        charId &&
        characterCards.some((c) => c.dataset.character === charId)
      ) {
        setSelected(charId);
      }
    });
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selected) {
      showSelectionError("Please select a character to continue.");
      dropSlot?.focus();
      return;
    }
    const trimmedName = sanitizeText(nameInput?.value || "", "");
    try {
      localStorage.setItem(USERNAME_KEY, trimmedName);
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY, selected);
    window.location.href = "/play";
  });

  nameInput?.addEventListener("input", () => {
    clearSelectionError();
    updateConfirmState();
  });

  closeBtn?.addEventListener("click", closeOverlay);
  startButton.addEventListener("click", openOverlay);

  leaderboardBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    renderLeaderboardSafe();
    if (leaderboardModal) leaderboardModal.hidden = false;
  });

    leaderboardClose?.addEventListener("click", () => {
      if (leaderboardModal) leaderboardModal.hidden = true;
    });
})();
