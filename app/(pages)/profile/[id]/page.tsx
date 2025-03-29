import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import UserLibrary from '@/app/components/profile/UserLibrary';
import UserProfileHeader from '@/app/components/profile/UserProfileHeader';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  try {
    const { db } = await connectToDatabase();
    let userId: string | ObjectId = params.id;
    
    // Try to convert to ObjectId if it's a valid format
    try {
      userId = new ObjectId(params.id);
    } catch (error) {
      // Keep as string if not a valid ObjectId
    }
    
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user) {
      return {
        title: 'User Not Found | NoobReaders',
        description: 'The requested user profile could not be found',
      };
    }
    
    const displayName = user.name || user.username || 'User';
    
    return {
      title: `${displayName}'s Profile | NoobReaders`,
      description: `${displayName}'s profile and reading library on NoobReaders`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'User Profile | NoobReaders',
      description: 'View user profile and reading library',
    };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  const isOwnProfile = session?.user?.id === params.id;
  
  try {
    const { db } = await connectToDatabase();
    let userId: string | ObjectId = params.id;
    
    // Try to convert to ObjectId if it's a valid format
    try {
      userId = new ObjectId(params.id);
    } catch (error) {
      // Keep as string if not a valid ObjectId
    }
    
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user) {
      notFound();
    }
    
    const userObject = {
      id: user._id.toString(),
      name: user.name || user.username || 'User',
      email: isOwnProfile ? user.email : undefined,
      image: user.image || undefined,
      bio: user.bio || 'No bio available.',
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <UserProfileHeader user={userObject} isOwnProfile={isOwnProfile} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {isOwnProfile ? 'My Library' : `${userObject.name}'s Library`}
          </h2>
          <UserLibrary userId={params.id} isOwnProfile={isOwnProfile} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
          <p>There was a problem fetching the user profile. Please try again later.</p>
        </div>
      </div>
    );
  }
} 