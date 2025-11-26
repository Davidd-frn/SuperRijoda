// Geo helper: fetch country code via IP and render flag/label
(function () {
  const COUNTRY_KEY = "playerCountryCode";

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

  async function fetchCountryCode() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("geo fetch failed");
      const data = await res.json();
      return (
        data.countryCode || data.country_code || data.countryCodeAlpha2 || ""
      );
    } catch (e) {
      return "";
    }
  }

  async function initCountryFlag({ statusEl, flagEl, countryEl } = {}) {
    if (statusEl) statusEl.textContent = "Detecting country...";

    let code = "";
    try {
      code = (localStorage.getItem(COUNTRY_KEY) || "").toUpperCase();
    } catch (e) {
      code = "";
    }

    if (!code) {
      code = await fetchCountryCode();
      if (code) {
        try {
          localStorage.setItem(COUNTRY_KEY, code);
        } catch (e) {}
      }
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
    if (statusEl) statusEl.textContent = code ? "" : "Country unavailable";

    return code;
  }

  window.Geo = {
    initCountryFlag,
    countryCodeToFlag,
    COUNTRY_KEY,
  };
})();
