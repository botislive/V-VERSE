import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ 
  subsets: ['latin'], 
  style: ['normal', 'italic'], 
  variable: '--font-display',
  display: 'swap' 
});

export const metadata: Metadata = {
  title: 'V-VERSE 1.0 Competition',
  description: 'Annual Literary Competition',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen flex flex-col selection:bg-[#0d6cf2]/30 antialiased font-sans transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
