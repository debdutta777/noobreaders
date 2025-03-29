import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfileRedirect() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    redirect('/signin?callbackUrl=/profile');
  }
  
  // Redirect to the user's profile using their ID
  redirect(`/profile/${session.user.id}`);
} 