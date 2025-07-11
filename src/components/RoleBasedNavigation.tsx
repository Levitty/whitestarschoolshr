
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
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/leave", label: "Leave Management", icon: Calendar },
    { path: "/leave-approval", label: "Leave Approval", icon: Calendar },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/upskilling", label: "Upskilling", icon: GraduationCap },
    { path: "/records", label: "Records", icon: FolderOpen },
    { path: "/tickets", label: "Tickets", icon: MessageSquare },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const hrNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/applications", label: "Applications", icon: Briefcase },
    { path: "/leave", label: "Leave Management", icon: Calendar },
    { path: "/leave-approval", label: "Leave Approval", icon: Calendar },
    { path: "/performance", label: "Performance", icon: BarChart },
    { path: "/upskilling", label: "Upskilling", icon: GraduationCap },
    { path: "/records", label: "Records", icon: FolderOpen },
    { path: "/tickets", label: "Tickets", icon: MessageSquare },
  ];

  const employeeNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
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
    <aside className="w-64 bg-blue-900 text-white min-h-screen shadow-xl">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold text-white">School HR Portal</h1>
      </div>
      <nav className="px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 ${
              isActive(item.path) 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-blue-100 hover:bg-blue-800 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-blue-950 border-t border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-blue-300 capitalize">
              {userRole || 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RoleBasedNavigation;
