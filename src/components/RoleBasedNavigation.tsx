
import { Home, Users, UserPlus, Briefcase, BarChart, FolderOpen, Calendar, GraduationCap, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface NavItem {
  path: string;
  label: string;
  icon: any;
}

const RoleBasedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const adminNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Requests", icon: Calendar },
    { path: "/upskilling", label: "Upskilling", icon: GraduationCap },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const hrNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave", label: "Leave Requests", icon: Calendar },
    { path: "/upskilling", label: "Upskilling", icon: GraduationCap },
  ];

  const employeeNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/leave", label: "My Leave Requests", icon: Calendar },
    { path: "/performance", label: "My Performance", icon: BarChart },
    { path: "/upskilling", label: "Training", icon: GraduationCap },
    { path: "/records", label: "My Documents", icon: FolderOpen },
  ];

  let navItems: NavItem[] = [];
  const userRole = profile?.role;

  if (userRole === "admin") {
    navItems = adminNavItems;
  } else if (userRole === "manager") {
    navItems = hrNavItems;
  } else {
    navItems = employeeNavItems;
  }

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case "admin":
        return "HR Admin";
      case "manager":
        return "HR Manager";
      case "staff":
        return "Staff";
      default:
        return "Employee";
    }
  };

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen shadow-xl flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold text-white">School HR Portal</h1>
      </div>
      
      <nav className="px-4 py-6 space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 text-left ${
              isActive(item.path) 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-blue-100 hover:bg-blue-800 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 bg-blue-950 border-t border-blue-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {profile?.first_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.email || 'User'
              }
            </p>
            <p className="text-xs text-blue-300">
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 rounded-lg p-2 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default RoleBasedNavigation;
