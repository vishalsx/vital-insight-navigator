
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  FileText, 
  BarChart2, 
  Settings, 
  Search, 
  Calendar, 
  Layers, 
  AlertCircle, 
  PieChart,
  Heart 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Patients", href: "/patients" },
  { icon: FileText, label: "Medical Records", href: "/records" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: Calendar, label: "Appointments", href: "/appointments" },
  { icon: Layers, label: "Resources", href: "/resources" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-screen w-64 border-r bg-white flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">CDMS</span>
      </div>
      
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full rounded-md border border-input pl-8 py-2 text-sm"
          />
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              location.pathname === item.href 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <div className="flex items-center gap-3 rounded-md bg-secondary p-3">
          <AlertCircle className="h-5 w-5 text-secondary-foreground" />
          <div className="text-xs">
            <p className="font-medium text-secondary-foreground">System Status</p>
            <p>All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
