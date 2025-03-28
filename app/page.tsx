import Link from 'next/link';
import { auth } from './lib/auth/auth';
import FeaturedNovels from './components/home/FeaturedNovels';
import LatestUpdates from './components/home/LatestUpdates';
import PopularNovels from './components/home/PopularNovels';
import GenreRecommendations from './components/home/GenreRecommendations';
import ContinueReading from './components/home/ContinueReading';

export default async function Home() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative bg-indigo-700 rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-600 opacity-90"></div>
        <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Discover Amazing Web Novels
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            Explore thousands of creative stories from talented writers around the world.
            Find your next favorite read today!
          </p>
          <Link 
            href="/explore"
            className="inline-block px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow-md hover:bg-indigo-50 transition duration-300"
          >
            Start Exploring
          </Link>
        </div>
      </div>

      {/* Continue Reading (for logged in users) */}
      {session && <ContinueReading userId={session.user.id} />}

      {/* Featured Novels */}
      <FeaturedNovels />

      {/* Latest Updates */}
      <LatestUpdates />

      {/* Popular This Week */}
      <PopularNovels period="week" />

      {/* Genre Recommendations */}
      <GenreRecommendations />
    </div>
  );
}
