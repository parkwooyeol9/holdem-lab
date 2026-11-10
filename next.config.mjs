/** @type {import('next').NextConfig} */
const nextConfig = {
  // Holdem Lab moved from the site root to /lab. Keep old bookmarks working.
  async redirects() {
    return ["learn", "practice", "hand-lab", "live", "progress", "lounge", "summary"].map((p) => ({
      source: `/${p}`,
      destination: `/lab/${p}`,
      permanent: false
    }));
  }
};

export default nextConfig;
