
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      <Navigation />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
