import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  bio: string;
  joinDate: string;
}

interface UserProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export default function UserProfileHeader({ user, isOwnProfile }: UserProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24 md:h-32"></div>
      <div className="p-6 sm:p-8 -mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="sm:ml-6 mt-4 sm:mt-12 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h1>
            {isOwnProfile && user.email && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Joined {user.joinDate}
            </p>
          </div>
          
          {isOwnProfile && (
            <div className="sm:ml-auto mt-4 sm:mt-12">
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {user.bio}
          </p>
        </div>
      </div>
    </div>
  );
} 