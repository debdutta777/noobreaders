import { handlers } from '@/auth';

export const { GET, POST } = handlers;

// Also export authOptions for backward compatibility
export { authConfig as authOptions } from '@/auth'; 