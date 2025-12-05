import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut, User, Search, Trophy, UserCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS, TIER_COLORS } from "@/hooks/useMembership";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Properties", path: "/search" },
  { label: "Lifestyle", path: "/lifestyle" },
  { label: "Services", path: "/concierge" },
  { label: "Membership", path: "/membership" },
];

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { tier } = useMembership();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logged out',
        description: 'Successfully logged out',
      });
      navigate('/');
    }
  };

  const isActivePath = (path: string) => {
    if (path === "/search") {
      return location.pathname === "/search" || location.pathname.startsWith("/property") || location.pathname.startsWith("/real-estate");
    }
    if (path === "/lifestyle") {
      return location.pathname === "/lifestyle" || location.pathname === "/shopping" || location.pathname === "/auction";
    }
    if (path === "/concierge") {
      return location.pathname.startsWith("/concierge") || location.pathname === "/community" || location.pathname === "/events";
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col group shrink-0">
            <span className="font-serif text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
              Balcom <span className="gradient-text-gold">Privé</span>
            </span>
            <span className="text-[9px] md:text-[10px] text-muted-foreground tracking-widest hidden sm:block leading-none">
              GLOBAL REAL ESTATE · WHITE-GLOVE CONCIERGE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-fast text-sm font-medium",
                    isActivePath(item.path) && "text-primary"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side: Search + Account */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Search Icon */}
            <Link to="/search">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                      <Badge className={`text-xs px-2.5 py-0.5 ${TIER_COLORS[tier]}`}>
                        {TIER_LABELS[tier]}
                      </Badge>
                      <User className="w-4 h-4" />
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                        <UserCircle className="w-4 h-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/community" className="flex items-center gap-2 cursor-pointer">
                        Events
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild>
                      <Link to="/sports" className="flex items-center gap-2 cursor-pointer">
                        <Trophy className="w-4 h-4" />
                        Sports Agent Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/athlete" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Athlete Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="default" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-primary transition-fast"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 space-y-2 border-t border-border/50 animate-fade-in">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-fast",
                  isActivePath(item.path) && "text-primary bg-primary/10"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}

            {/* Events link */}
            <Link
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-fast",
                location.pathname === "/community" && "text-primary bg-primary/10"
              )}
            >
              Events
            </Link>
            
            <div className="px-4 pt-4 space-y-3 border-t border-border/50">
              {!loading && (
                user ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`text-xs px-2.5 py-0.5 ${TIER_COLORS[tier]}`}>
                        {TIER_LABELS[tier]} Member
                      </Badge>
                    </div>
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2" size="lg">
                        <User className="w-5 h-5" />
                        My Account
                      </Button>
                    </Link>
                    <Link to="/sports" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2" size="lg">
                        <Trophy className="w-5 h-5" />
                        Sports Agent Portal
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2" 
                      size="lg"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full" size="lg">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full" size="lg">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
