import { Home, Users, UserPlus, Briefcase, BarChart, FolderOpen, Calendar, GraduationCap, Settings, LogOut, Menu, X, Crown, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { getRoleDisplayName, getRoleColor } from "@/utils/roleUtils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
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

  switch (userRole) {
    case "superadmin":
    case "admin":
      navItems = superAdminNavItems;
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

  const NavigationContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn(
      "h-full flex flex-col bg-card overflow-hidden",
      !isMobile && "rounded-2xl shadow-xl border border-border/50"
    )}>
      {/* Logo & Brand */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">HR</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">HR Portal</h1>
            <p className="text-xs text-muted-foreground">{getRoleDisplayName(profile?.role)}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left group",
                active 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200",
                !active && "group-hover:scale-110"
              )} />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight className="h-4 w-4 opacity-70" />
              )}
            </button>
          );
        })}
        
        {/* SaaS Admin Link */}
        {isSaasAdmin && (
          <>
            <div className="my-4 border-t border-border/50"></div>
            <p className="px-3 text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-3">Platform Admin</p>
            <button
              onClick={() => handleNavigation('/saas-admin')}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left",
                location.pathname === '/saas-admin'
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25" 
                  : "text-amber-600 hover:bg-amber-50"
              )}
            >
              <Crown className="h-[18px] w-[18px] flex-shrink-0" />
              <span>SaaS Admin</span>
            </button>
          </>
        )}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
            <span className="text-primary font-semibold text-sm">
              {profile?.first_name?.charAt(0).toUpperCase() || profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mt-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
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
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-card shadow-md border-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-0">
          <NavigationContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-[calc(100vh-24px)] flex-shrink-0">
        <NavigationContent />
      </aside>
    </>
  );
};

export default RoleBasedNavigation;
