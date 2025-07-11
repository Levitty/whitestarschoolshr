
import { Home, Users, UserPlus, Briefcase, BarChart, FolderOpen, Calendar, GraduationCap, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  path: string;
  label: string;
  icon: any;
}

const RoleBasedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Navigation items for different roles
  const superAdminNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Management", icon: Calendar },
    { path: "/upskilling", label: "Training", icon: GraduationCap },
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
  ];

  const teacherStaffNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/leave", label: "My Leave", icon: Calendar },
    { path: "/performance", label: "My Performance", icon: BarChart },
    { path: "/upskilling", label: "My Training", icon: GraduationCap },
    { path: "/records", label: "My Documents", icon: FolderOpen },
  ];

  let navItems: NavItem[] = [];

  switch (profile?.role) {
    case "superadmin":
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

  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case "superadmin":
        return "Super Administrator";
      case "head":
        return "Department Head";
      case "teacher":
        return "Teacher";
      case "staff":
        return "Staff Member";
      default:
        return "User";
    }
  };

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case "superadmin":
        return "bg-red-900 border-red-800";
      case "head":
        return "bg-purple-900 border-purple-800";
      case "teacher":
        return "bg-green-900 border-green-800";
      case "staff":
        return "bg-blue-900 border-blue-800";
      default:
        return "bg-blue-900 border-blue-800";
    }
  };

  return (
    <aside className={`w-64 text-white min-h-screen shadow-xl flex flex-col ${getRoleColor(profile?.role)}`}>
      <div className="p-6 border-b border-opacity-20 border-white">
        <h1 className="text-xl font-bold text-white">HR Portal</h1>
        <p className="text-xs text-white/70 mt-1">{getRoleDisplayName(profile?.role)}</p>
      </div>
      
      <nav className="px-4 py-6 space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 text-left ${
              isActive(item.path) 
                ? "bg-white/20 text-white shadow-md" 
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 bg-black/20 border-t border-white/20">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-white/70">
              {getRoleDisplayName(profile?.role)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 rounded-lg p-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default RoleBasedNavigation;
