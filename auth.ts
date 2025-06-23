// auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './src/app/api/auth/[...nextauth]/route';

export const auth = () => getServerSession(authOptions);
