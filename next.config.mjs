import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Worktrees keep a second lockfile above this repo. Pin tracing to this project.
  outputFileTracingRoot: root,
  // Keep old bookmarks working: the lab used to live at the site root, and "learn" merged into "train".
  async redirects() {
    return [
      ...["practice", "hand-lab", "live", "progress", "lounge", "summary"].map((p) => ({
        source: `/${p}`,
        destination: `/lab/${p}`,
        permanent: false
      })),
      { source: "/learn", destination: "/lab/train", permanent: false },
      { source: "/lab/learn", destination: "/lab/train", permanent: false }
    ];
  }
};

export default nextConfig;
