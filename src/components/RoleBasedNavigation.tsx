import { Home, Users, UserPlus, Briefcase, BarChart, FolderOpen, Calendar, GraduationCap, Settings, LogOut, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { getRoleDisplayName, getRoleColor } from "@/utils/roleUtils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
interface NavItem {
  path: string;
  label: string;
  icon: any;
}

const RoleBasedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  console.log('Current profile:', profile);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close mobile menu after navigation
  };

  const superAdminNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Management", icon: Calendar },
    { path: "/upskilling", label: "Training", icon: GraduationCap },
    { path: "/tickets", label: "Support Tickets", icon: Settings },
    { path: "/settings", label: "System Settings", icon: Settings },
  ];

  const headNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "My Team", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Team Performance", icon: BarChart },
    { path: "/records", label: "Team Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Approvals", icon: Calendar },
    { path: "/upskilling", label: "Team Training", icon: GraduationCap },
    { path: "/tickets", label: "Support", icon: Settings },
  ];

  const teacherStaffNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/leave", label: "My Leave", icon: Calendar },
    { path: "/performance", label: "My Performance", icon: BarChart },
    { path: "/upskilling", label: "My Training", icon: GraduationCap },
    { path: "/records", label: "My Documents", icon: FolderOpen },
    { path: "/tickets", label: "Support", icon: Settings },
  ];

  let navItems: NavItem[] = [];

  const userRole = profile?.role;
  console.log('User role:', userRole);

  switch (userRole) {
    case "superadmin":
    case "admin": // Handle both for backward compatibility
      navItems = superAdminNavItems;
      console.log('Assigned superadmin navigation items');
      break;
    case "head":
      navItems = headNavItems;
      break;
    case "teacher":
    case "staff":
    default:
      navItems = teacherStaffNavItems;
      break;
  }

  if (!profile) {
    return null;
  }

  const NavigationContent = () => (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">HR</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">HR Portal</h1>
            <p className="text-xs text-muted-foreground">{getRoleDisplayName(profile?.role)}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Menu</p>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left ${
              isActive(item.path) 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 mt-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shadow-xl">
        <NavigationContent />
      </aside>
    </>
  );
};

export default RoleBasedNavigation;
