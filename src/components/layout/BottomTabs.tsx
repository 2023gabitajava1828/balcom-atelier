import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Sparkles, User } from "lucide-react";

const tabs = [
  { label: "Home", path: "/", icon: Home },
  { label: "Properties", path: "/search", icon: Building2 },
  { label: "Services", path: "/concierge", icon: Sparkles },
  { label: "Account", path: "/account", icon: User },
];

export const BottomTabs = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/search") {
      return location.pathname === "/search" || 
             location.pathname.startsWith("/property") || 
             location.pathname.startsWith("/real-estate");
    }
    if (path === "/concierge") {
      return location.pathname.startsWith("/concierge") || 
             location.pathname === "/lifestyle" ||
             location.pathname === "/shopping" ||
             location.pathname === "/auction" ||
             location.pathname === "/community" ||
             location.pathname === "/events";
    }
    if (path === "/account") {
      return location.pathname === "/account" || 
             location.pathname === "/membership" ||
             location.pathname === "/sports" ||
             location.pathname === "/athlete";
    }
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 mb-1 ${active ? "stroke-[2.5px]" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
