export const PAGE_PATH = {
  home: "/",
  learn: "/learn",
  practice: "/practice",
  handlab: "/hand-lab",
  live: "/live",
  progress: "/progress",
  lounge: "/lounge",
  summary: "/summary"
};

const PATH_PAGE = Object.fromEntries(Object.entries(PAGE_PATH).map(([page, path]) => [path, page]));

export function pageFromPath(pathname = "/") {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  return PATH_PAGE[clean] || "home";
}

export function pathFromPage(page, query) {
  const base = PAGE_PATH[page] || "/";
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
