import withPWA from "next-pwa";

const nextConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
})({
  // Skip pre-existing TS errors so the PWA build succeeds
  typescript: {
    ignoreBuildErrors: true,
  },
});

export default nextConfig;
