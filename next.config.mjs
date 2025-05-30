/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    enabled: true,
  },
  experimental: {
    serverActions: {}, // use object instead of `true`
  },
};

export default nextConfig;
