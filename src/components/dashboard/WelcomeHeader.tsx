import { format } from 'date-fns';
import { CalendarDays, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WelcomeHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
}

const WelcomeHeader = ({ firstName, lastName, avatarUrl, role }: WelcomeHeaderProps) => {
  const today = new Date();
  const greeting = getGreeting();
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

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
        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
          <AvatarImage src={avatarUrl || undefined} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white font-semibold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
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
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="relative bg-white shadow-sm border-0">
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
