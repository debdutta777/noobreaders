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
};

module.exports = nextConfig; 