
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Home, Users, Briefcase, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile, hasRole } = useProfile();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <NavigationMenu className="relative">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-md transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Home className="w-4 h-4 mr-2 inline" />
            Dashboard
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="hover:bg-accent">
            <Users className="w-4 h-4 mr-2" />
            HR Management
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px]">
              <NavigationMenuLink asChild>
                <Link
                  to="/employees"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Employees</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Manage employee profiles and information
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link
                  to="/leave"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Leave Management</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Handle leave requests and balances
                  </p>
                </Link>
              </NavigationMenuLink>
              {hasRole('head') && (
                <NavigationMenuLink asChild>
                  <Link
                    to="/leave/calendar"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">Leave Calendar</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View approved leaves in calendar format
                    </p>
                  </Link>
                </NavigationMenuLink>
              )}
              <NavigationMenuLink asChild>
                <Link
                  to="/records"
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">Records</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Access employee records and documents
                  </p>
                </Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link
            to="/recruitment"
            className={`px-4 py-2 rounded-md transition-colors ${
              location.pathname === '/recruitment'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Briefcase className="w-4 h-4 mr-2 inline" />
            Recruitment
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link
            to="/tickets"
            className={`px-4 py-2 rounded-md transition-colors ${
              location.pathname === '/tickets'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <HelpCircle className="w-4 h-4 mr-2 inline" />
            Support
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="absolute right-4 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none focus:outline-none rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-2">
            <DropdownMenuLabel>{profile?.full_name || 'User'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/performance" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </NavigationMenu>
  );
};

export default Navigation;
