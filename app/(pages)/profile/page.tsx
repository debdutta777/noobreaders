import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfileRedirect() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    redirect('/signin?callbackUrl=/profile');
  }
  
  // Redirect to the user's profile using their ID
  redirect(`/profile/${session.user.id}`);
} 