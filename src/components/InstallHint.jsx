import { useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext";

// Chrome/Edge/Android fire `beforeinstallprompt` once, often before React has
// mounted, so capture it at module load and let components subscribe.
let deferred = null;
const listeners = new Set();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach((fn) => fn(e));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((fn) => fn(null));
  });
}

function isStandalone() {
  if (typeof window === "undefined") return true; // pre-rendering at build time: render nothing
  return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone);
}

function isIos() {
  const ua = window.navigator.userAgent || "";
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && (window.navigator.maxTouchPoints || 0) > 1);
}

// A small footer link. Chromium browsers: opens the native install prompt.
// iOS (no install API): shows how to use Share > Add to Home Screen.
// Anything else, or an already-installed app: renders nothing.
export default function InstallHint() {
  const { data } = useLocale();
  const t = data.ui.install;
  const [prompt, setPrompt] = useState(() => deferred);
  const [showIos, setShowIos] = useState(false);
  const standalone = isStandalone();

  useEffect(() => {
    const fn = (e) => setPrompt(e);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  if (standalone) return null;
  if (!prompt && !isIos()) return null;

  const onClick = async () => {
    if (prompt) {
      prompt.prompt();
      await prompt.userChoice?.catch(() => {});
      deferred = null;
      setPrompt(null);
    } else {
      setShowIos((v) => !v);
    }
  };

  return (
    <span className="install">
      <button type="button" className="install-btn" onClick={onClick} aria-expanded={prompt ? undefined : showIos}>
        {t.button} +
      </button>
      {showIos && !prompt && (
        <span className="install-ios" role="status">
          {t.ios}
        </span>
      )}
    </span>
  );
}
