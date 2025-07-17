// auth.ts
import { getServerSession} from 'next-auth';
import { authOptions } from './src/auth';

export const auth = () => getServerSession(authOptions);