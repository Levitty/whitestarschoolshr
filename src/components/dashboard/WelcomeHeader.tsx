import { format } from 'date-fns';
import { CalendarDays, Bell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTenant } from '@/contexts/TenantContext';
import { useEffect, useState } from 'react';

interface WelcomeHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
}

const WelcomeHeader = ({ firstName, lastName, avatarUrl, role }: WelcomeHeaderProps) => {
  const { tenant } = useTenant();
  const today = new Date();
  const greeting = getGreeting();
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
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
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-4">
        {/* Institution Logo or Avatar */}
        {tenant?.logo_url ? (
          <img 
            src={tenant.logo_url} 
            alt={tenant.name || 'Institution'} 
            className="h-14 w-14 rounded-xl object-contain border-2 border-white shadow-md bg-white p-1"
          />
        ) : (
          <Avatar className="h-14 w-14 border-2 border-white shadow-md">
            <AvatarImage src={avatarUrl || undefined} alt={`${firstName} ${lastName}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {firstName || 'there'}! 👋
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
          className="bg-card shadow-sm border-0"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button variant="outline" size="icon" className="relative bg-card shadow-sm border-0">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
            3
          </span>
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;
