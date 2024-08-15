import './globals.css';
import { Inter } from 'next/font/google';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Video Sharing Platform',
  description: 'Share and watch videos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
      
          {children}
      
          
      </body>
    </html>
  );
}