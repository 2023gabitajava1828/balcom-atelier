import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

// Partner logos
// import atlantaLogo from "@/assets/partners/atlanta-fine-homes-sir.png";
// import miamiLogo from "@/assets/partners/one-sothebys-miami.png";
import dubaiLogo from "@/assets/partners/dubai-sothebys.png";

interface FooterProps {
  className?: string;
}

const partners = [
  {
    name: "Atlanta Fine Homes",
    subtitle: "Sotheby's International Realty",
    market: "Atlanta",
    website: "https://atlantafinehomes.com",
    logo: null as string | null,
  },
  {
    name: "ONE Sotheby's",
    subtitle: "International Realty",
    market: "Miami",
    website: "https://onesothebysrealty.com",
    logo: null as string | null,
  },
  {
    name: "Dubai Sotheby's",
    subtitle: "International Realty",
    market: "Dubai",
    website: "https://sothebysrealty.ae",
    logo: dubaiLogo,
    invertLogo: true, // Make logo white on dark background
  },
];

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

        {/* Real Estate Advisory Partners */}
        <div className="py-10">
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-8">
            Real Estate Advisory Partners
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {partners.map((partner) => (
              <a
                key={partner.market}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center p-6 rounded-lg hover:bg-background/50 transition-all duration-300"
              >
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} ${partner.subtitle}`}
                    className={`h-12 w-auto object-contain mb-4 opacity-80 group-hover:opacity-100 transition-opacity ${'invertLogo' in partner && partner.invertLogo ? 'brightness-0 invert' : ''}`}
                  />
                ) : (
                  <div className="mb-3">
                    <p className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {partner.name}
                    </p>
                    <p className="font-serif text-sm text-muted-foreground italic">
                      {partner.subtitle}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground/70">
                    {partner.market}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </a>
            ))}
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
      <div className="bg-background border-t border-border/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground/70">
            Each office is independently owned and operated. Sotheby's International Realty® is a registered trademark licensed to Sotheby's International Realty Affiliates LLC.
          </p>
        </div>
      </div>
    </footer>
  );
};
