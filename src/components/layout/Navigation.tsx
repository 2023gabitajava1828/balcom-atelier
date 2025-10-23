import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Real Estate", path: "/real-estate" },
  { label: "Concierge", path: "/concierge" },
  { label: "Style", path: "/style" },
  { label: "Wealth", path: "/wealth" },
  { label: "Community", path: "/community" },
  { label: "Membership", path: "/membership" },
];

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold gradient-text-gold">
              Balcom Privé
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-foreground/80 hover:text-foreground transition-elegant",
                    location.pathname === item.path && "text-primary"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Account Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/account">
              <Button variant="premium" size="default">
                Account
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 space-y-4 border-t border-border">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-2 text-foreground/80 hover:text-primary transition-elegant",
                  location.pathname === item.path && "text-primary font-semibold"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="premium" size="default" className="w-full">
                Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
