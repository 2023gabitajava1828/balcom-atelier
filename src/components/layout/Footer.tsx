import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import sothebysLogo from "@/assets/sothebys-logo.jpg";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-card border-t border-border/50 ${className || ""}`}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Branding */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-3">
                Balcom <span className="gradient-text-gold">Privé</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Curating exceptional experiences in luxury real estate, white-glove concierge, and tailored lifestyle services across 84+ countries.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-muted-foreground">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Properties", path: "/search" },
                { label: "Lifestyle", path: "/lifestyle" },
                { label: "Concierge", path: "/concierge" },
                { label: "Events", path: "/community" },
                { label: "Membership", path: "/membership" },
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-muted-foreground hover:text-primary transition-fast"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Markets */}
          <div>
            <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest text-muted-foreground">
              Markets
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Atlanta", path: "/real-estate/atlanta" },
                { label: "Miami", path: "/real-estate/miami" },
                { label: "Dubai", path: "/real-estate/dubai" },
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-muted-foreground hover:text-primary transition-fast"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-sm text-muted-foreground">
          <div className="text-center md:text-left">
            <p>&copy; {currentYear} Balcom Privé. All rights reserved.</p>
            <p className="text-xs mt-1">
              Licensed in Georgia | Equal Housing Opportunity
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-fast text-xs">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-fast text-xs">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Sotheby's Brand Bar */}
      <div className="bg-background border-t border-border/50 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          <img 
            src={sothebysLogo} 
            alt="Sotheby's International Realty" 
            className="h-8 w-auto object-contain opacity-70"
          />
          <p className="text-center text-xs text-muted-foreground/70">
            Each office is independently owned and operated. Sotheby's International Realty® is a registered trademark licensed to Sotheby's International Realty Affiliates LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};
