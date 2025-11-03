import { Button } from "@/components/ui/button";
import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  Award, 
  TrendingUp,
  Heart 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Intro", path: "/guide/intro" },
  { icon: ClipboardList, label: "Profile", path: "/guide/onboarding" },
  { icon: BookOpen, label: "Modules", path: "/guide/modules" },
  { icon: Heart, label: "Breeds", path: "/guide/recommendations" },
  { icon: TrendingUp, label: "Progress", path: "/guide/progress" },
  { icon: Award, label: "Certificate", path: "/guide/certificate" },
];

export function GuideNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className={cn(
              "gap-2",
              isActive && "shadow-sm"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
