import { format } from 'date-fns';
import { CalendarDays, Bell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { useEffect, useState } from 'react';
import { getRoleDisplayName } from '@/utils/roleUtils';
import { UserRole } from '@/types/auth';

interface WelcomeHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
}

const WelcomeHeader = ({ firstName, role }: WelcomeHeaderProps) => {
  const { tenant } = useTenant();
  const today = new Date();
  const greeting = getGreeting();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  function getGreeting() {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const formatRole = (role: string | null | undefined) => {
    if (!role) return '';
    return getRoleDisplayName(role as UserRole, tenant?.tenant_type);
  };

  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-4">
        {/* Institution Logo */}
        {tenant?.logo_url && (
          <img 
            src={tenant.logo_url} 
            alt={tenant.name || 'Institution'} 
            className="h-12 w-12 rounded-lg object-contain border border-border bg-card p-1"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {firstName || 'there'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">
              {formatRole(role)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {format(today, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleDarkMode}
          className="bg-card shadow-sm"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button variant="outline" size="icon" className="relative bg-card shadow-sm">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-medium">
            3
          </span>
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;
