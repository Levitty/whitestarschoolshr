
import React from 'react';
import RoleBasedNavigation from '@/components/RoleBasedNavigation';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedNavigation />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
