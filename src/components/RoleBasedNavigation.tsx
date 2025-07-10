
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Home,
  FileText,
  LogOut,
  Briefcase,
  Calendar,
  Upload,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const RoleBasedNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { profile, canAccessAdmin, canAccessManager } = useProfile();

  // Navigation items based on user roles
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'manager', 'staff'] },
    ];

    const adminItems = [
      { name: 'Employees', href: '/employees', icon: Users, roles: ['admin'] },
      { name: 'Recruitment', href: '/recruitment', icon: Users, roles: ['admin'] },
      { name: 'Applications', href: '/applications', icon: Briefcase, roles: ['admin'] },
      { name: 'Performance', href: '/performance', icon: BarChart3, roles: ['admin', 'manager'] },
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
    ];

    const managerItems = [
      { name: 'My Team', href: '/my-team', icon: Users, roles: ['manager'] },
      { name: 'Team Performance', href: '/team-performance', icon: BarChart3, roles: ['manager'] },
    ];

    const staffItems = [
      { name: 'Documents', href: '/records', icon: FileText, roles: ['staff', 'manager', 'admin'] },
      { name: 'Leave Requests', href: '/leave', icon: Calendar, roles: ['staff', 'manager', 'admin'] },
      { name: 'Upskilling', href: '/upskilling', icon: GraduationCap, roles: ['staff', 'manager', 'admin'] },
    ];

    const allItems = [...baseItems, ...adminItems, ...managerItems, ...staffItems];

    // Filter items based on user role
    return allItems.filter(item => {
      if (!profile?.role) return false;
      return item.roles.includes(profile.role);
    });
  };

  const navigationItems = getNavigationItems();

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/auth';
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || 'User';
  };

  const getRoleDisplayName = () => {
    switch (profile?.role) {
      case 'admin':
        return 'HR Admin';
      case 'manager':
        return 'Manager';
      case 'staff':
        return 'Staff';
      default:
        return 'User';
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-slate-800">
            <h1 className="text-xl font-bold text-white">School HR Portal</h1>
          </div>

          {/* Navigation items */}
          <div className="flex-1 px-3 py-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User section */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {getRoleDisplayName()}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default RoleBasedNavigation;
