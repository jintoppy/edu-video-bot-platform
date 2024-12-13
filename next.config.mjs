/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ggnq2ibyxzl45eeo.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
