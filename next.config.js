/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning rather than error on build to prevent CI/CD failures
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
