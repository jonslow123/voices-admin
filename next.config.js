/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Static export
  images: {
    unoptimized: true, // For static export
    domains: ['*'] // Allow images from any domain
  },
  // Add rewrites and other configurations as needed
  
  // Performance optimizations
  reactStrictMode: true,
  experimental: {
    // Speed up builds
    optimizeCss: true,
  },
};

module.exports = nextConfig; 