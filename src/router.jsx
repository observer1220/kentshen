import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STATIC_ROUTES = ["/", "/blog", "/contact", "/about", "/privacy"];

export function normalizePath(pathname) {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/index.html") return "/";
  if (STATIC_ROUTES.includes(p) || /^\/blog\/[^/]+$/.test(p)) return p;
  return "/404"; // unknown path: App renders the not-found page
}

function currentPath() {
  return normalizePath(window.location.pathname);
}

function scrollToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const el = id && document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.scrollTo(0, 0);
}

const RouterContext = createContext(null);

// initialPath is only passed when pre-rendering at build time (no window there);
// in the browser the path always comes from the address bar.
export function RouterProvider({ initialPath, children }) {
  const [path, setPath] = useState(() => (initialPath ? normalizePath(initialPath) : currentPath()));

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to) => {
    const current = window.location.pathname + window.location.hash;
    if (to !== current) window.history.pushState({}, "", to);
    setPath(currentPath());
    // wait one frame so the new page has rendered before scrolling to its #anchor
    requestAnimationFrame(scrollToHash);
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

// A real <a href> (so open-in-new-tab and copy-link work) that navigates
// in-page on a plain left click.
export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
