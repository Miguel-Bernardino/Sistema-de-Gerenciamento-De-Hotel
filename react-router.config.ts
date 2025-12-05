import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Ignore well-known and other static paths
  async preloadRouteAssets(matches) {
    return [];
  },
} satisfies Config;
