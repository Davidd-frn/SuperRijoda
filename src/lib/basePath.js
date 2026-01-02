const rawBase = import.meta.env.BASE_URL || "/";
const BASE_URL = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

const HTTP_REGEX = /^https?:\/\//i;

export const withBase = (path = "") => {
  if (!path) return BASE_URL;
  if (HTTP_REGEX.test(path)) return path;
  if (path.startsWith(BASE_URL)) return path;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE_URL}${normalized}`;
};

export const setGameBackground = (assetPath) => {
  const url = assetPath ? `url(${withBase(assetPath)})` : "none";
  document.documentElement.style.setProperty("--game-bg-url", url);
};

export { BASE_URL };
