import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Compliance Manager Pro',
  description:
    'Construction compliance management platform for verifying insurance and compliance documents for subcontractors and vendors.',
  keywords: [
    'construction',
    'compliance',
    'insurance',
    'certificates',
    'subcontractors',
    'vendors',
  ],
  authors: [{ name: 'Compliance Manager Pro' }],
  openGraph: {
    title: 'Compliance Manager Pro',
    description: 'Construction compliance management platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}