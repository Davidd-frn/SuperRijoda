const loadedScripts = new Map();

const loadScript = (src, { forceReload = false } = {}) =>
  new Promise((resolve, reject) => {
    if (forceReload) {
      const existingTag = loadedScripts.get(src);
      if (existingTag && existingTag.parentNode) {
        existingTag.parentNode.removeChild(existingTag);
      }
      loadedScripts.delete(src);
    }

    if (loadedScripts.has(src)) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && !forceReload) {
      loadedScripts.set(src, existing);
      resolve();
      return;
    }

    const el = document.createElement("script");
    el.src = src;
    el.async = false;
    el.onload = () => {
      loadedScripts.set(src, el);
      resolve();
    };
    el.onerror = () =>
      reject(new Error(`Failed to load script: ${src || "unknown"}`));
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
    const tag = loadedScripts.get(src);
    if (tag && tag.parentNode) {
      tag.parentNode.removeChild(tag);
    }
    loadedScripts.delete(src);
  });
};
