import { 
  Home, 
  Users, 
  UserPlus, 
  Briefcase, 
  BarChart, 
  FolderOpen, 
  Calendar, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Menu,
  ChevronDown,
  Clock,
  DollarSign,
  CalendarDays,
  Ticket
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { getRoleDisplayName } from "@/utils/roleUtils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/whitestar-logo.png";

interface NavItem {
  path: string;
  label: string;
  icon: any;
}

interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
}

const RoleBasedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["Dashboard"]);

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

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const superAdminNavGroups: NavGroup[] = [
    {
      label: "Dashboard",
      icon: Home,
      items: [
        { path: "/dashboard", label: "Overview", icon: Home },
      ]
    },
    {
      label: "Employee Management",
      icon: Users,
      items: [
        { path: "/employees", label: "All Employees", icon: Users },
        { path: "/recruitment", label: "Recruitment", icon: UserPlus },
        { path: "/applications", label: "Applications", icon: Briefcase },
      ]
    },
    {
      label: "Attendance Management",
      icon: Clock,
      items: [
        { path: "/performance", label: "Performance", icon: BarChart },
        { path: "/upskilling", label: "Training", icon: GraduationCap },
      ]
    },
    {
      label: "Payroll Management",
      icon: DollarSign,
      items: [
        { path: "/records", label: "Documents", icon: FolderOpen },
      ]
    },
    {
      label: "Leaves",
      icon: CalendarDays,
      items: [
        { path: "/leave", label: "Leave Management", icon: Calendar },
      ]
    },
    {
      label: "Settings",
      icon: Settings,
      items: [
        { path: "/tickets", label: "Support Tickets", icon: Ticket },
        { path: "/settings", label: "System Settings", icon: Settings },
      ]
    },
  ];

  const headNavGroups: NavGroup[] = [
    {
      label: "Dashboard",
      icon: Home,
      items: [
        { path: "/dashboard", label: "Overview", icon: Home },
      ]
    },
    {
      label: "Team Management",
      icon: Users,
      items: [
        { path: "/employees", label: "My Team", icon: Users },
        { path: "/recruitment", label: "Recruitment", icon: UserPlus },
        { path: "/applications", label: "Applications", icon: Briefcase },
      ]
    },
    {
      label: "Performance",
      icon: BarChart,
      items: [
        { path: "/performance", label: "Team Performance", icon: BarChart },
        { path: "/upskilling", label: "Team Training", icon: GraduationCap },
      ]
    },
    {
      label: "Documents",
      icon: FolderOpen,
      items: [
        { path: "/records", label: "Team Documents", icon: FolderOpen },
      ]
    },
    {
      label: "Leaves",
      icon: CalendarDays,
      items: [
        { path: "/leave", label: "Leave Approvals", icon: Calendar },
      ]
    },
    {
      label: "Support",
      icon: Ticket,
      items: [
        { path: "/tickets", label: "Support", icon: Ticket },
      ]
    },
  ];

  const teacherStaffNavGroups: NavGroup[] = [
    {
      label: "Dashboard",
      icon: Home,
      items: [
        { path: "/dashboard", label: "Overview", icon: Home },
      ]
    },
    {
      label: "My Profile",
      icon: Users,
      items: [
        { path: "/performance", label: "My Performance", icon: BarChart },
        { path: "/upskilling", label: "My Training", icon: GraduationCap },
      ]
    },
    {
      label: "Leave",
      icon: CalendarDays,
      items: [
        { path: "/leave", label: "My Leave", icon: Calendar },
      ]
    },
    {
      label: "Documents",
      icon: FolderOpen,
      items: [
        { path: "/records", label: "My Documents", icon: FolderOpen },
      ]
    },
    {
      label: "Support",
      icon: Ticket,
      items: [
        { path: "/tickets", label: "Support", icon: Ticket },
      ]
    },
  ];

  let navGroups: NavGroup[] = [];

  const userRole = profile?.role;

  switch (userRole) {
    case "superadmin":
    case "admin":
      navGroups = superAdminNavGroups;
      break;
    case "head":
    case "deputy_head":
      navGroups = headNavGroups;
      break;
    case "teacher":
    case "staff":
    default:
      navGroups = teacherStaffNavGroups;
      break;
  }

  if (!profile) {
    return null;
  }

  const NavigationContent = () => (
    <div className="bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] h-full flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Whitestar" className="h-10 w-10 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-white">Whitestar</h1>
            <p className="text-xs text-[hsl(var(--sidebar-muted))]">HR Portal</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <Collapsible 
            key={group.label} 
            open={openGroups.includes(group.label)}
            onOpenChange={() => toggleGroup(group.label)}
          >
            <CollapsibleTrigger className="w-full">
              <div className={cn(
                "flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-[hsl(var(--sidebar-accent))]",
                openGroups.includes(group.label) && "text-white"
              )}>
                <div className="flex items-center gap-3">
                  <group.icon className="h-5 w-5" />
                  <span>{group.label}</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  openGroups.includes(group.label) && "rotate-180"
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 mt-1 space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors text-left",
                      isActive(item.path) 
                        ? "bg-[hsl(var(--sidebar-primary))] text-white font-medium" 
                        : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
      
      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 bg-[hsl(var(--sidebar-accent))] rounded-full flex items-center justify-center text-white font-medium">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-[hsl(var(--sidebar-muted))]">
              {getRoleDisplayName(profile?.role)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
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
        <SheetContent side="left" className="p-0 w-64 border-none">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shadow-xl flex-shrink-0">
        <NavigationContent />
      </aside>
    </>
  );
};

export default RoleBasedNavigation;
