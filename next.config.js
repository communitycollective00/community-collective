/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Compression
  compress: true,

  // Production source maps disabled for smaller bundle
  productionBrowserSourceMaps: false,

  // Optimized font loading
  optimizeFonts: true,
};

module.exports = nextConfig;
