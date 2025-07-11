
import { Home, Calendar, Users, FileText, UserPlus, MessageSquare, Settings, GraduationCap, BarChart, Briefcase, FolderOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  path: string;
  label: string;
  icon: any;
}

const RoleBasedNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const adminNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave-approval", label: "Leave Requests", icon: Calendar },
    { path: "/upskilling", label: "Upskilling", icon: GraduationCap },
  ];

  const hrNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/records", label: "Documents", icon: FolderOpen },
    { path: "/leave-approval", label: "Leave Requests", icon: Calendar },
    { path: "/upskilling", label: "Upskilling", icon: GraduationCap },
    { path: "/tickets", label: "Support", icon: MessageSquare },
  ];

  const employeeNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/leave", label: "Leave Requests", icon: Calendar },
    { path: "/performance", label: "My Performance", icon: BarChart },
    { path: "/upskilling", label: "Training", icon: GraduationCap },
    { path: "/records", label: "My Documents", icon: FileText },
    { path: "/tickets", label: "Support", icon: MessageSquare },
  ];

  let navItems: NavItem[] = [];
  const userRole = user?.role;

  if (userRole === "admin") {
    navItems = adminNavItems;
  } else if (userRole === "hr") {
    navItems = hrNavItems;
  } else {
    navItems = employeeNavItems;
  }

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">School HR Portal</h1>
      </div>
      <nav className="px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 rounded-md p-3 text-sm font-medium transition-colors ${
              isActive(item.path) 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {userRole || 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RoleBasedNavigation;
