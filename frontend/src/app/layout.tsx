import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';   // 👈 import the client wrapper

export const metadata = {
  title: 'Team Portal',
  description: 'Bidding portal with teams',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}