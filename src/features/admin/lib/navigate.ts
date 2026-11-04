import type { Route } from "next";

/**
 * A full page load, so the server reads the fresh session cookies and no client router cache is
 * stale. Its own module so tests can stub it.
 */
export function navigateTo(path: Route) {
  window.location.replace(path);
}
