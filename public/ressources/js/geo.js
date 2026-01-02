// Geo helper with multi-fallback: IP lookup -> geolocation -> reverse geocode
(function () {
  const COUNTRY_KEY = "playerCountryCode";

  // Convert ISO 3166-1 alpha-2 country code to flag emoji
  const countryCodeToFlag = (code) => {
    if (!code || code.length !== 2) return "";
    const offset = 127397;
    return String.fromCodePoint(
      ...code
        .toUpperCase()
        .split("")
        .map((c) => c.charCodeAt(0) + offset)
    );
  };


  // Fetch country code from multiple IP geolocation services
  async function fetchCountryCode() {
    const endpoints = [
      { url: "https://ipwho.is/?fields=country_code", field: "country_code" },
      { url: "https://ipapi.co/country/", plain: true },
      { url: "https://ifconfig.co/json", field: "country" },
    ];


    // Try each endpoint until one returns a valid country code
    for (const ep of endpoints) {
      try {
        // Append a cache-busting query parameter
        const res = await fetch(ep.url, { cache: "no-store" });
        if (!res.ok) continue;
        // Handle plain text response
        if (ep.plain) {
          const txt = (await res.text()).trim();
          if (txt.length === 2) return txt.toUpperCase();
          continue;
        }
        const data = await res.json();
        const code = (data?.[ep.field] || "").toString().trim();
        if (code.length === 2) return code.toUpperCase();
      } catch (e) {
        continue;
      }
    }
    return "";
  }


  // Geolocate using browser API
  const geolocateBrowser = () =>
    // Returns a Promise that resolves to GeolocationCoordinates
    new Promise((resolve, reject) => {
      if (!navigator?.geolocation) {
        reject(new Error("no geolocation API"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        {
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    });


  // Reverse geocode coordinates to country code
  async function reverseCountryFromCoords(coords) {
    if (!coords) return "";
    const { latitude, longitude } = coords;
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      latitude
    )}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;
    
    // Append a cache-busting query parameter
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return "";
      const data = await res.json();
      const code = (data?.countryCode || "").trim();
      return code.length === 2 ? code.toUpperCase() : "";
    } catch (e) {
      return "";
    }
  }


  // Initialize country flag display with multi-fallback detection
  async function initCountryFlag({ statusEl, flagEl, countryEl } = {}) {
    if (statusEl) statusEl.textContent = "Detecting country...";

    let code = "";
    // Try to read cached country code
    try {
      code = (localStorage.getItem(COUNTRY_KEY) || "").toUpperCase();
    } catch (e) {
      code = "";
    }

    // Always attempt fresh fetch to reflect VPN/location changes.
    let freshCode = await fetchCountryCode();

    if (!freshCode) {
      try {
        const coords = await geolocateBrowser();
        freshCode = await reverseCountryFromCoords(coords);
      } catch (e) {
        // ignore
      }
    }

    if (freshCode) {
      code = freshCode;
      try {
        localStorage.setItem(COUNTRY_KEY, code);
      } catch (e) {}
    }

    const flagEmoji = countryCodeToFlag(code);
    const flagUrl = code
      ? `https://flagcdn.com/24x18/${code.toLowerCase()}.png`
      : "";

    if (flagEl) {
      if (flagUrl) {
        flagEl.src = flagUrl;
        flagEl.alt = code;
        flagEl.hidden = false;
      } else {
        flagEl.hidden = true;
      }
    }
    if (countryEl) {
      countryEl.textContent = `Country: ${flagEmoji || "--"}`;
    }
    if (statusEl)
      statusEl.textContent = code
        ? `Detected: ${code}`
        : "Country unavailable (allow geolocation or pick manually)";

    return code;
  }


  // Expose globally
  window.Geo = {
    initCountryFlag,
    countryCodeToFlag,
    COUNTRY_KEY,
  };
})();

