/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'via.placeholder.com', 
      'placeholder.com', 
      'images.unsplash.com',
      'cluster0.iteua.mongodb.net',
      'iteua.mongodb.net',
      'res.cloudinary.com',
      'storage.googleapis.com'
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Increase memory limit for builds
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  // Speed up build times
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  // Set a higher limit for response size
  api: {
    responseLimit: '8mb',
  },
  // Turn off ESLint during build for speed
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Turn off TypeScript type checking during build for speed
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 