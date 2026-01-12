import { Outlet } from 'react-router-dom';
import RoleBasedNavigation from '@/components/RoleBasedNavigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

const Layout = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-muted/40">
        {/* Sidebar with padding for floating effect */}
        <div className="hidden lg:block p-3 pr-0">
          <RoleBasedNavigation />
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <RoleBasedNavigation />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 lg:p-6 pt-16 lg:pt-6 min-h-full">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
