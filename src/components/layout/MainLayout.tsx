'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  showHeader?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showFooter = true,
  showHeader = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}

      <main className={cn('flex-1', className)}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};

export { MainLayout };
