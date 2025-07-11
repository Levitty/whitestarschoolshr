
import { Home, Calendar, Users, FileText, UserPlus, MessageSquare, Settings } from "lucide-react";
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
    { path: "/records", label: "Records", icon: FileText },
    { path: "/leave-approval", label: "Leave Approval", icon: Calendar },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/tickets", label: "Support", icon: MessageSquare },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const hrNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employees", icon: Users },
    { path: "/records", label: "Records", icon: FileText },
    { path: "/leave-approval", label: "Leave Approval", icon: Calendar },
    { path: "/recruitment", label: "Recruitment", icon: UserPlus },
    { path: "/tickets", label: "Support", icon: MessageSquare },
  ];

  const employeeNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/leave", label: "Leave Requests", icon: Calendar },
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">School HR Portal</h1>
      </div>
      <nav className="px-4 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-2 rounded-md p-3 text-sm font-medium transition-colors ${
              isActive(item.path) 
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole || 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RoleBasedNavigation;
