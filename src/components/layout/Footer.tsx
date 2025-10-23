import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Home, Mail, Phone, MapPin } from "lucide-react";
import sothebysLogo from "@/assets/sothebys-logo.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-background to-muted/50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Branding */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="font-serif text-2xl font-bold mb-2 gradient-text-gold">
                Luxury Living Collective
              </h3>
              <p className="text-sm text-foreground/70 mb-4">
                Curating exceptional experiences in luxury real estate, style, and lifestyle
              </p>
            </div>
            
            {/* Sotheby's Logo */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-foreground/60 font-semibold">
                Brokerage
              </p>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg border border-primary/20 shadow-lg">
                <img 
                  src={sothebysLogo} 
                  alt="Atlanta Fine Homes Sotheby's International Realty"
                  className="h-14 w-auto object-contain opacity-95"
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/real-estate" className="text-foreground/70 hover:text-primary transition-colors">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link to="/concierge" className="text-foreground/70 hover:text-primary transition-colors">
                  Concierge
                </Link>
              </li>
              <li>
                <Link to="/style" className="text-foreground/70 hover:text-primary transition-colors">
                  Style
                </Link>
              </li>
              <li>
                <Link to="/wealth" className="text-foreground/70 hover:text-primary transition-colors">
                  Wealth
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-foreground/70 hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Markets */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Markets</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/real-estate/atlanta" className="text-foreground/70 hover:text-primary transition-colors">
                  Atlanta
                </Link>
              </li>
              <li>
                <Link to="/real-estate/miami" className="text-foreground/70 hover:text-primary transition-colors">
                  Miami
                </Link>
              </li>
              <li>
                <Link to="/real-estate/dubai" className="text-foreground/70 hover:text-primary transition-colors">
                  Dubai
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <div className="text-center md:text-left">
            <p>&copy; {currentYear} Luxury Living Collective. All rights reserved.</p>
            <p className="text-xs mt-1">
              Licensed in Georgia | Equal Housing Opportunity
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors text-xs">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors text-xs">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Sotheby's Brand Bar */}
      <div className="bg-background border-t py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-foreground/50">
            Each office is independently owned and operated. Sotheby's International Realty® is a registered trademark licensed to Sotheby's International Realty Affiliates LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};
