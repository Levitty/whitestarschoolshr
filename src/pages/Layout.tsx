
import { Outlet } from 'react-router-dom';
import RoleBasedNavigation from '@/components/RoleBasedNavigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

const Layout = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <RoleBasedNavigation />
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
