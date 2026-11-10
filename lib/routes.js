// 연구소 (the Holdem research lab) lives under /lab; the rest of the site is the trip guide.
export const LAB_BASE = "/lab";

export const PAGE_PATH = {
  home: LAB_BASE,
  train: `${LAB_BASE}/train`,
  practice: `${LAB_BASE}/practice`,
  handlab: `${LAB_BASE}/hand-lab`,
  live: `${LAB_BASE}/live`,
  progress: `${LAB_BASE}/progress`,
  lounge: `${LAB_BASE}/lounge`,
  summary: `${LAB_BASE}/summary`
};

const PATH_PAGE = Object.fromEntries(Object.entries(PAGE_PATH).map(([page, path]) => [path, page]));

export function pageFromPath(pathname = LAB_BASE) {
  const clean = (pathname || LAB_BASE).replace(/\/+$/, "") || "/";
  return PATH_PAGE[clean] || "home";
}

export function pathFromPage(page, query) {
  const base = PAGE_PATH[page] || LAB_BASE;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
