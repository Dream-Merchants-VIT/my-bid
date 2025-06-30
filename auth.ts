// auth.ts
import { getServerSession} from 'next-auth';
import { authOptions } from '@/auth';

export const auth = () => getServerSession(authOptions);