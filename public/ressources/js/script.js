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
  const selectionError = document.getElementById("characterSelectionError");
  const leaderboardBtn = document.getElementById("leaderboardBtn");
  const leaderboardModal = document.getElementById("leaderboardModal");
  const leaderboardList = document.getElementById("leaderboardList");
  const leaderboardClose = document.getElementById("leaderboardClose");
  const loginModal = document.getElementById("loginModal");
  const loginForm = document.getElementById("loginForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");
  const loginCancel = document.getElementById("loginCancel");
  const loginState = document.getElementById("loginState");
  const logoutBtn = document.getElementById("logoutBtn");

  const STORAGE_KEY = "selectedCharacter";
  const USERNAME_KEY = "playerName";
  const USERS_KEY = "authUsers";
  const SESSION_KEY = "authSession";
  const LEADERBOARD_KEY = "leaderboard";
  const normalizeBase = (b) => {
    const val = typeof b === "string" && b.trim() ? b.trim() : "/";
    const prefixed = val.startsWith("/") ? val : `/${val}`;
    return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
  };
  const BASE_URL = normalizeBase(window.__BASE_URL__);
  const withBase = (p = "") => {
    if (!p) return BASE_URL;
    if (/^https?:\/\//i.test(p)) return p;
    const clean = p.startsWith("/") ? p.slice(1) : p;
    return `${BASE_URL}${clean}`;
  };
  const LEADERBOARD_URL = withBase("ressources/leaderboard.json");
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBHxxKPcTca5MKyBGw7KlGQpkv8gKZPd08",
    authDomain: "super-rijoda.firebaseapp.com",
    projectId: "super-rijoda",
    storageBucket: "super-rijoda.firebasestorage.app",
    messagingSenderId: "511869869048",
    appId: "1:511869869048:web:ff06987dee9f2b8b71d40d",
    measurementId: "G-W4HZR80TB0",
  };

  let firebaseApi = null;
  const getFirestoreApi = async () => {
    if (firebaseApi) return firebaseApi;
    const [{ initializeApp, getApps }, firestore, authModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"),
      import(
        "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"
      ),
      import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js"),
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    const { getFirestore, collection, getDocs, query, orderBy, limit } =
      firestore;
    const { getAuth, signInAnonymously } = authModule;
    const db = getFirestore(app);
    const auth = getAuth(app);
    // Anonymous login so request.auth != null for Firestore rules.
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn("Anonymous auth failed", e);
    }
    firebaseApi = {
      db,
      auth,
      collection,
      getDocs,
      query,
      orderBy,
      limit,
    };
    return firebaseApi;
  };

  if (!startButton || !overlay) return;

  let selected = null;
  let currentUser = "";

  const hasName = () => true;

  const getLabelFor = (id) => {
    const card = characterCards.find((c) => c.dataset.character === id);
    return (
      card?.querySelector(".character-name")?.textContent?.trim() || id || ""
    );
  };

  // Sanitize text by removing angle brackets and trimming whitespace.
  const sanitizeText = (val, fallback = "") => {
    if (typeof val !== "string") return fallback;
    return val.replace(/[<>]/g, "").trim() || fallback;
  };

  // Simple password "hashing" using base64 encoding.
  const hashPassword = (pwd) => {
    const safe = typeof pwd === "string" ? pwd : "";
    try {
      return btoa(unescape(encodeURIComponent(safe)));
    } catch (e) {
      return safe;
    }
  };

  // Read the list of registered users from localStorage.
  const readUsers = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  };

  // Write the list of registered users to localStorage.
  const writeUsers = (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users || []));
    } catch (e) {}
  };

  // Set the current session user.
  const setSessionUser = (username) => {
    try {
      localStorage.setItem(SESSION_KEY, username);
      localStorage.setItem(USERNAME_KEY, username);
    } catch (e) {}
    currentUser = username;
  };

  // Get the current session user.
  const getSessionUser = () => {
    try {
      return localStorage.getItem(SESSION_KEY) || "";
    } catch (e) {
      return "";
    }
  };

  // Clear the current session user.
  const clearSessionUser = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    currentUser = "";
  };

  // Authenticate or register a user with username and password.
  const authenticateUser = (username, password) => {
    const name = sanitizeText(username, "");
    const pass = typeof password === "string" ? password : "";
    if (!name || pass.length < 6) {
      throw new Error(
        "Please provide username and password (min. 6 characters)."
      );
    }
    const users = readUsers();
    const hashed = hashPassword(pass);
    const existing = users.find((u) => u?.username === name);
    if (existing && existing.password !== hashed) {
      throw new Error("This user already exists with a different password.");
    }
    if (!existing) {
      users.push({ username: name, password: hashed });
      writeUsers(users);
    }
    setSessionUser(name);
    return name;
  };

  // Update the login state display and logout button.
  const updateLoginState = () => {
    const activeUser = currentUser || getSessionUser() || "";
    if (activeUser && !currentUser) {
      currentUser = activeUser;
    }
    if (loginState) {
      loginState.textContent = activeUser
        ? `Logged in as ${activeUser}`
        : "Not logged in";
    }
    if (logoutBtn) {
      logoutBtn.disabled = !activeUser;
      logoutBtn.classList.toggle("disabled", !activeUser);
    }
  };

  // Sort leaderboard entries by score (desc) and time (asc).
  const sortLeaderboard = (a, b) => {
    const scoreA = Number(a?.score) || 0;
    const scoreB = Number(b?.score) || 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    const timeA = Number.isFinite(a?.time) ? a.time : Infinity;
    const timeB = Number.isFinite(b?.time) ? b.time : Infinity;
    return timeA - timeB;
  };

  // Normalize a raw leaderboard entry.
  const normalizeEntry = (entry) => {
    if (!entry || typeof entry !== "object") return null;
    const name = sanitizeText(entry.name, "Anonymous");
    const score = Number(entry.score) || 0;
    const time = Number(entry.time);
    const countryCode = sanitizeText(entry.countryCode || "", "").toUpperCase();
    return {
      name,
      score,
      time: Number.isFinite(time) ? time : null,
      countryCode,
    };
  };

  // Pick the best entry between two based on score and time.
  const pickBestEntry = (existing, next) => {
    if (!existing) return next;
    if (next.score !== existing.score) {
      return next.score > existing.score ? next : existing;
    }
    const existingTime = Number.isFinite(existing.time)
      ? existing.time
      : Infinity;
    const nextTime = Number.isFinite(next.time) ? next.time : Infinity;
    if (nextTime !== existingTime) {
      return nextTime < existingTime ? next : existing;
    }
    // If score/time are equal, prefer the newer entry (next) to refresh meta such as country.
    return next;
  };

  const mergeEntries = (...entryLists) => {
    // Later lists have higher priority (e.g., remote overrides local when tied).
    const bestByName = new Map();
    entryLists.flat().forEach((raw) => {
      const entry = normalizeEntry(raw);
      if (!entry) return;
      const currentBest = bestByName.get(entry.name);
      bestByName.set(entry.name, pickBestEntry(currentBest, entry));
    });
    return Array.from(bestByName.values()).sort(sortLeaderboard);
  };

  // Fetch leaderboard from static JSON file.
  const fetchLeaderboardFile = async () => {
    try {
      const res = await fetch(LEADERBOARD_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.entries)) return data.entries;
    } catch (err) {}
    return [];
  };

  // Fetch leaderboard from remote Firestore database.
  const fetchLeaderboardRemote = async () => {
    try {
      const { db, collection, getDocs, query, orderBy } =
        await getFirestoreApi();
      const colRef = collection(db, "leaderboard");
      // Best effort: order by score; final sort happens client-side.
      const q = query(colRef, orderBy("score", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      console.warn("Remote leaderboard unavailable", err);
      return [];
    }
  };

  // Read leaderboard from localStorage.
  const readLocalLeaderboard = () => {
    try {
      return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
    } catch (e) {
      return [];
    }
  };

  // Load leaderboard entries from remote Firestore only.
  const loadLeaderboard = async () => {
    const remoteEntries = await fetchLeaderboardRemote();
    return mergeEntries(remoteEntries);
  };

  // Get flag image URL from country code.
  const flagUrlFromCode = (code) => {
    const cc = String(code || "").trim();
    if (cc.length !== 2) return "";
    return `https://flagcdn.com/24x18/${cc.toLowerCase()}.png`;
  };

  // Clear any selection error messages.
  const clearSelectionError = () => {
    if (selectionError) {
      selectionError.hidden = true;
      selectionError.textContent = "";
    }
    if (dropSlot) {
      dropSlot.setAttribute("aria-invalid", "false");
    }
  };

  // Show a selection error message.
  const showSelectionError = (message) => {
    if (selectionError) {
      selectionError.hidden = false;
      selectionError.textContent = message;
    }
    if (dropSlot) {
      dropSlot.setAttribute("aria-invalid", "true");
    }
  };

  // Update the confirm button state based on selection and name.
  const updateConfirmState = () => {
    const ready = Boolean(selected) && hasName();
    if (confirmBtn) {
      confirmBtn.disabled = !ready;
      confirmBtn.classList.toggle("disabled", !ready);
    }
  };

  // Update the drop slot selected display.
  const updateDropSelected = () => {
    if (!dropSelected || !dropSlot) return;
    if (selected) {
      dropSelected.hidden = false;
      dropSelected.textContent = `Selected: ${getLabelFor(selected)}`;
    } else {
      dropSelected.hidden = true;
    }
  };

  // Set the currently selected character.
  const setSelected = (id) => {
    if (!id) return;
    selected = id;
    highlightSelection();
    updateDropSelected();
    updatePreview();
    clearSelectionError();
    updateConfirmState();
  };

  // Update the character preview display.
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

  // Highlight the selected character card.
  const highlightSelection = () => {
    characterCards.forEach((card) => {
      const isActive = card.dataset.character === selected;
      card.classList.toggle("active", isActive);
      card.setAttribute("aria-pressed", isActive);
    });
  };

  const openOverlay = (event) => {
    event?.preventDefault();
    overlay.hidden = false;
    form?.reset();
    selected = null;
    clearSelectionError();
    highlightSelection();
    updateDropSelected();
    updatePreview();
    updateConfirmState();
    updateLoginState();
    if (window.Geo?.initCountryFlag) {
      window.Geo.initCountryFlag().catch(() => {});
    }
  };

  const clearLoginError = () => {
    if (loginError) {
      loginError.hidden = true;
      loginError.textContent = "";
    }
  };

  const showLoginError = (message) => {
    if (!loginError) return;
    loginError.hidden = !message;
    loginError.textContent = message || "";
  };

  const openLoginModal = () => {
    if (loginModal) {
      loginModal.hidden = false;
    }
    loginForm?.reset();
    clearLoginError();
    loginUsername?.focus();
  };

  const closeLoginModal = () => {
    if (loginModal) {
      loginModal.hidden = true;
    }
    clearLoginError();
  };

  const closeOverlay = () => {
    overlay.hidden = true;
  };

  // Render the leaderboard entries safely.
  const renderLeaderboardSafe = async () => {
    if (!leaderboardList) return;
    const entries = await loadLeaderboard();
    leaderboardList.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "leaderboard-empty";
      empty.textContent = "No scores yet.";
      leaderboardList.appendChild(empty);
      return;
    }
    entries.forEach((e, idx) => {
      const row = document.createElement("div");
      row.className = "leaderboard-row";

      const left = document.createElement("div");
      left.className = "leaderboard-left";

      const rank = document.createElement("span");
      rank.className = "leaderboard-rank";
      rank.textContent = `#${idx + 1}`;
      left.appendChild(rank);

      const flagUrl = flagUrlFromCode(e.countryCode);
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

  // Character card click selection.
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selected) {
      showSelectionError("Please select a character to continue.");
      dropSlot?.focus();
      return;
    }
    // Ensure a player name exists from the current session.
    try {
      const activeUser = currentUser || getSessionUser();
      if (activeUser) {
        localStorage.setItem(USERNAME_KEY, activeUser);
      } else if (!localStorage.getItem(USERNAME_KEY)) {
        localStorage.setItem(USERNAME_KEY, "Player");
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEY, selected);
    window.location.href = withBase("#/play");
    window.location.reload();
  });

  // Event listeners for buttons and forms.
  closeBtn?.addEventListener("click", closeOverlay);
  startButton.addEventListener("click", (e) => {
    e.preventDefault();
    const activeUser = currentUser || getSessionUser();
    if (activeUser) {
      currentUser = activeUser;
      updateLoginState();
      openOverlay();
    } else {
      openLoginModal();
    }
  });

  // Leaderboard button click.
  leaderboardBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    await renderLeaderboardSafe();
    if (leaderboardModal) leaderboardModal.hidden = false;
  });

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    clearLoginError();
    try {
      const user = authenticateUser(
        loginUsername?.value || "",
        loginPassword?.value || ""
      );
      currentUser = user;
      updateLoginState();
      closeLoginModal();
      openOverlay();
    } catch (err) {
      showLoginError(err?.message || "Login failed.");
    }
  });

  loginCancel?.addEventListener("click", closeLoginModal);

  logoutBtn?.addEventListener("click", () => {
    clearSessionUser();
    updateLoginState();
  });

  leaderboardClose?.addEventListener("click", () => {
    if (leaderboardModal) leaderboardModal.hidden = true;
  });

  // Init login state on load.
  updateLoginState();
})();
