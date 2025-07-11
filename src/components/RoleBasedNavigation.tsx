
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
    <div className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 ${
            isActive(item.path) ? "bg-gray-100 font-medium" : ""
          }`}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  );
};

export default RoleBasedNavigation;
