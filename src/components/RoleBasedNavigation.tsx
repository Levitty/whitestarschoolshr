import { Home, Users, UserPlus, Briefcase, BarChart, FolderOpen, Calendar, GraduationCap, Settings, LogOut, Menu, X, Crown, ChevronRight, ClipboardList, Monitor, ClipboardCheck, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { getRoleDisplayName, getRoleColor } from "@/utils/roleUtils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useTenantLabels } from "@/hooks/useTenantLabels";
import { useTenant } from "@/contexts/TenantContext";

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
  const { labels, hiddenFeatures, isCorporate } = useTenantLabels();
  const { tenant } = useTenant();

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

  // Dynamic labels based on tenant type
  const employeesLabel = isCorporate ? labels.employees : "Employees";
  const headLabel = isCorporate ? labels.headTeacher : "Head Teacher";

  const superAdminNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: employeesLabel, icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Management", icon: Calendar },
    { path: "/tasks", label: "Tasks", icon: ClipboardList },
    { path: "/upskilling", label: "Training", icon: GraduationCap },
    { path: "/tickets", label: "Support Tickets", icon: Settings },
    { path: "/settings", label: "System Settings", icon: Settings },
  ];

  // Corporate-only Operations items
  const operationsNavItems: NavItem[] = isCorporate ? [
    { path: "/assets", label: "Asset Management", icon: Monitor },
    { path: "/clearances", label: "Clearances", icon: ClipboardCheck },
  ] : [];

  const headNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: isCorporate ? "My Team" : "My Team", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Team Performance", icon: BarChart },
    { path: "/records", label: "Team Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Approvals", icon: Calendar },
    { path: "/tasks", label: "Tasks", icon: ClipboardList },
    { path: "/upskilling", label: "Team Training", icon: GraduationCap },
    { path: "/tickets", label: "Support", icon: Settings },
  ];

  const teacherStaffNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/leave", label: "My Leave", icon: Calendar },
    { path: "/tasks", label: "My Tasks", icon: ClipboardList },
    { path: "/performance", label: "My Performance", icon: BarChart },
    { path: "/upskilling", label: "My Training", icon: GraduationCap },
    { path: "/records", label: "My Documents", icon: FolderOpen },
    { path: "/profile", label: "My Profile", icon: UserCircle },
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
      "h-full flex flex-col overflow-hidden",
      !isMobile && "rounded-2xl shadow-xl"
    )} style={{
      backgroundColor: 'hsl(var(--sidebar-background))',
      color: 'hsl(var(--sidebar-foreground))',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'hsl(var(--sidebar-border))'
    }}>
      {/* Logo & Brand */}
      <div className="p-5" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-3">
          {tenant?.logo_url ? (
            <img 
              src={tenant.logo_url} 
              alt={`${tenant.name} logo`}
              className="h-10 w-10 object-contain rounded-xl"
              style={{ maxHeight: '40px' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{
              background: 'linear-gradient(135deg, hsl(var(--sidebar-primary)), hsl(var(--sidebar-primary) / 0.8))',
              boxShadow: '0 4px 12px hsl(var(--sidebar-primary) / 0.3)'
            }}>
              <span style={{ color: 'hsl(var(--sidebar-primary-foreground))' }} className="font-bold text-lg">
                {tenant?.name?.charAt(0).toUpperCase() || 'HR'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'hsl(var(--sidebar-foreground))' }}>
              {tenant?.name || 'HR Portal'}
            </h1>
            <p className="text-xs" style={{ color: 'hsl(var(--sidebar-muted))' }}>{getRoleDisplayName(profile?.role)}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'hsl(var(--sidebar-muted))' }}>Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left group"
              style={{
                backgroundColor: active ? 'hsl(var(--sidebar-primary))' : 'transparent',
                color: active ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-muted))',
                boxShadow: active ? '0 4px 12px hsl(var(--sidebar-primary) / 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-accent))';
                  e.currentTarget.style.color = 'hsl(var(--sidebar-accent-foreground))';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'hsl(var(--sidebar-muted))';
                }
              }}
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
        
        {/* Operations Section - Corporate Only */}
        {isCorporate && operationsNavItems.length > 0 && (userRole === 'superadmin' || userRole === 'admin' || userRole === 'head') && (
          <>
            <div className="my-4" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}></div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'hsl(var(--sidebar-muted))' }}>Operations</p>
            {operationsNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left group"
                  style={{
                    backgroundColor: active ? 'hsl(var(--sidebar-primary))' : 'transparent',
                    color: active ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-muted))',
                    boxShadow: active ? '0 4px 12px hsl(var(--sidebar-primary) / 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-accent))';
                      e.currentTarget.style.color = 'hsl(var(--sidebar-accent-foreground))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'hsl(var(--sidebar-muted))';
                    }
                  }}
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
          </>
        )}
        
        {/* SaaS Admin Link */}
        {isSaasAdmin && (
          <>
            <div className="my-4" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}></div>
            <p className="px-3 text-[10px] font-semibold text-amber-500 uppercase tracking-widest mb-3">Platform Admin</p>
            <button
              onClick={() => handleNavigation('/saas-admin')}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left",
                location.pathname === '/saas-admin'
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25" 
                  : "text-amber-500 hover:bg-amber-500/10"
              )}
            >
              <Crown className="h-[18px] w-[18px] flex-shrink-0" />
              <span>SaaS Admin</span>
            </button>
          </>
        )}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-3" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
        <button
          onClick={() => handleNavigation('/profile')}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
          style={{ 
            backgroundColor: location.pathname === '/profile' ? 'hsl(var(--sidebar-primary))' : 'hsl(var(--sidebar-accent))',
            color: location.pathname === '/profile' ? 'hsl(var(--sidebar-primary-foreground))' : 'inherit'
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== '/profile') {
              e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-accent) / 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/profile') {
              e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-accent))';
            }
          }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
            background: location.pathname === '/profile' 
              ? 'hsl(var(--sidebar-primary-foreground) / 0.2)' 
              : 'linear-gradient(135deg, hsl(var(--sidebar-primary) / 0.3), hsl(var(--sidebar-primary) / 0.1))',
            boxShadow: '0 0 0 2px hsl(var(--sidebar-primary) / 0.3)'
          }}>
            <span className="font-semibold text-sm" style={{ 
              color: location.pathname === '/profile' ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-primary))' 
            }}>
              {profile?.first_name?.charAt(0).toUpperCase() || profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate" style={{ 
              color: location.pathname === '/profile' ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-foreground))' 
            }}>
              {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.full_name || 'User'}
            </p>
            <p className="text-xs truncate" style={{ 
              color: location.pathname === '/profile' ? 'hsl(var(--sidebar-primary-foreground) / 0.7)' : 'hsl(var(--sidebar-muted))' 
            }}>
              {profile?.email}
            </p>
          </div>
          <UserCircle className="h-4 w-4" style={{ 
            color: location.pathname === '/profile' ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-muted))' 
          }} />
        </button>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mt-2 text-sm font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
          style={{ color: 'hsl(var(--sidebar-muted))' }}
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
