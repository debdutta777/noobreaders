import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/app/lib/mongodb';

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This is where you would typically verify credentials against your database
        // For now, we're keeping it simple for the deployment to work
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For testing purposes only - replace with actual DB check
        // In production, you should validate against your database
        // For example: const user = await db.collection('users').findOne({ email: credentials.email });
        const user = {
          id: '1',
          name: 'Test User',
          email: credentials.email,
        };

        return user;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/auth/signup',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // When credentials are used for sign-in, don't assign random ID
      if (account?.provider === 'credentials') {
        token.email = user.email;
        token.sub = user.email; // Use email as the subject/id for credential users
      }
      
      if (user) {
        // Safely pass user ID to token to avoid ObjectId format issues
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Use the email as a reliable way to identify users
        session.user.id = token.sub || token.email;
        session.user.email = token.email;
      }
      return session;
    },
  },
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig); 