import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | NoobReaders',
  description: 'Learn more about NoobReaders, our mission and our team',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About NoobReaders</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-6">
            NoobReaders is a platform dedicated to connecting writers with readers who are passionate about discovering new stories. Our mission is to provide a space where emerging authors can share their work and build their audience.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
          <p className="mb-6">
            Founded in 2023, NoobReaders began as a small project by a group of literature enthusiasts who wanted to create a more accessible platform for reading and sharing original fiction. What started as a simple idea has grown into a vibrant community of writers and readers from around the world.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="mb-6">
            We believe that everyone has a story to tell, and we're committed to helping those stories find their audience. Our platform is designed to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Promote diverse voices and perspectives in literature</li>
            <li className="mb-2">Provide tools and resources for writers to improve their craft</li>
            <li className="mb-2">Create a supportive community where feedback and discussion are encouraged</li>
            <li className="mb-2">Make reading accessible and enjoyable for everyone</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
          <p className="mb-6">
            Whether you're a writer looking to share your work or a reader seeking your next favorite story, we invite you to join our community. Sign up today to start exploring, reading, and connecting with others who share your passion for storytelling.
          </p>
          
          <div className="flex justify-center mt-10">
            <Link 
              href="/auth/signup" 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join NoobReaders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 