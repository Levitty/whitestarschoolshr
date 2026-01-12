import { Home, Users, UserPlus, Briefcase, BarChart, FolderOpen, Calendar, GraduationCap, Settings, LogOut, Menu, X, Crown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { getRoleDisplayName, getRoleColor } from "@/utils/roleUtils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  path: string;
  label: string;
  icon: any;
}

const RoleBasedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaasAdmin, setIsSaasAdmin] = useState(false);

  useEffect(() => {
    const checkSaasAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('saas_admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsSaasAdmin(!!data);
    };
    checkSaasAdmin();
  }, [user]);

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
    <div className="h-full flex flex-col sidebar-glass">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--sidebar-primary))] flex items-center justify-center shadow-lg">
            <span className="text-[hsl(var(--sidebar-primary-foreground))] font-bold text-lg">HR</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">HR Portal</h1>
            <p className="text-xs text-[hsl(var(--sidebar-muted))]">{getRoleDisplayName(profile?.role)}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-medium text-[hsl(var(--sidebar-muted))] uppercase tracking-wider mb-3">Menu</p>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left ${
              isActive(item.path) 
                ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-lg shadow-[hsl(var(--sidebar-primary))]/25" 
                : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
            }`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
        {/* SaaS Admin Link */}
        {isSaasAdmin && (
          <>
            <div className="my-4 border-t border-[hsl(var(--sidebar-border))]"></div>
            <p className="px-3 text-xs font-medium text-amber-400 uppercase tracking-wider mb-3">Platform Admin</p>
            <button
              onClick={() => handleNavigation('/saas-admin')}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left ${
                location.pathname === '/saas-admin'
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25" 
                  : "text-amber-400 hover:bg-amber-500/20"
              }`}
            >
              <Crown className="h-5 w-5 flex-shrink-0" />
              <span>SaaS Admin</span>
            </button>
          </>
        )}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(var(--sidebar-accent))]/50 backdrop-blur-sm">
          <div className="w-9 h-9 rounded-full bg-[hsl(var(--sidebar-primary))]/20 flex items-center justify-center ring-2 ring-[hsl(var(--sidebar-primary))]/30">
            <span className="text-[hsl(var(--sidebar-primary))] font-semibold text-sm">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[hsl(var(--sidebar-foreground))] truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-[hsl(var(--sidebar-muted))] truncate">
              {profile?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 mt-2 text-sm font-medium text-[hsl(var(--sidebar-muted))] hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
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
