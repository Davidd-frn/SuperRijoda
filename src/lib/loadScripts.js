import { withBase } from "./basePath.js";

const loadedScripts = new Map();

const loadScript = (src, { forceReload = false } = {}) =>
  new Promise((resolve, reject) => {
    const resolvedSrc = withBase(src);

    if (forceReload) {
      const existingTag = loadedScripts.get(resolvedSrc);
      if (existingTag && existingTag.parentNode) {
        existingTag.parentNode.removeChild(existingTag);
      }
      loadedScripts.delete(resolvedSrc);
    }

    if (loadedScripts.has(resolvedSrc)) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${resolvedSrc}"]`);
    if (existing && !forceReload) {
      loadedScripts.set(resolvedSrc, existing);
      resolve();
      return;
    }

    const el = document.createElement("script");
    el.src = resolvedSrc;
    el.async = false;
    el.onload = () => {
      loadedScripts.set(resolvedSrc, el);
      resolve();
    };
    el.onerror = () =>
      reject(new Error(`Failed to load script: ${resolvedSrc || "unknown"}`));
    document.body.appendChild(el);
  });

export const loadScriptsSequential = async (sources = [], opts = {}) => {
  for (const src of sources) {
    // eslint-disable-next-line no-await-in-loop
    await loadScript(src, opts);
  }
};

export const unloadScripts = (sources = []) => {
  sources.forEach((src) => {
    const resolvedSrc = withBase(src);
    const tag = loadedScripts.get(resolvedSrc);
    if (tag && tag.parentNode) {
      tag.parentNode.removeChild(tag);
    }
    loadedScripts.delete(resolvedSrc);
  });
};
