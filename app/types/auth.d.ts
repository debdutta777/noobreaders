import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    userType?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      userType?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userType?: string;
  }
} 