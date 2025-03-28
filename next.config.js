/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com', 'placeholder.com', 'images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig; 