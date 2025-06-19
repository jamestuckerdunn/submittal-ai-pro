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
  title: 'SubmittalAI Pro - Coming Soon',
  description:
    'AI-powered construction submittal review platform. Automatically analyze submittals against project specifications, reducing review time from days to minutes.',
  keywords: [
    'construction',
    'submittal',
    'AI',
    'review',
    'compliance',
    'specifications',
  ],
  authors: [{ name: 'SubmittalAI Pro' }],
  openGraph: {
    title: 'SubmittalAI Pro - Coming Soon',
    description: 'AI-powered construction submittal review platform',
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
