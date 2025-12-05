import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, Trophy, MessageSquare, User } from "lucide-react";

const tabs = [
  { label: "Home", path: "/", icon: Home },
  { label: "Search", path: "/search", icon: Search },
  { label: "Shop", path: "/shopping", icon: ShoppingBag },
  { label: "Sports", path: "/sports", icon: Trophy },
  { label: "Concierge", path: "/concierge", icon: MessageSquare },
];

export const BottomTabs = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path !== "/" && location.pathname.startsWith(tab.path));
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 mb-1 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
