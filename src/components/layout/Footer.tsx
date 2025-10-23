import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Home, Mail, Phone, MapPin } from "lucide-react";
import sothebysLogo from "@/assets/sothebys-logo.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-white/10">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left Side - Contact Info */}
          <div>
            <h3 className="font-serif text-3xl font-bold mb-8 tracking-wider">
              GET IN TOUCH
            </h3>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Email</p>
                  <a href="mailto:contact@luxurylivingcollective.com" className="text-white hover:text-primary transition-colors">
                    contact@luxurylivingcollective.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Phone Number</p>
                  <a href="tel:+14045551234" className="text-white hover:text-primary transition-colors">
                    (404) 555-1234
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Address</p>
                  <p className="text-white">
                    3770 Covington Highway<br />
                    Decatur, GA 30032
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Logo */}
          <div className="flex items-start justify-end">
            <div className="max-w-xs">
              <img 
                src={sothebysLogo} 
                alt="Atlanta Fine Homes Sotheby's International Realty"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-xs text-white/60 leading-relaxed mb-6">
            Sotheby's International Realty® and the Sotheby's International Realty Logo are service marks licensed to Sotheby's International Realty Affiliates LLC and used with permission. Atlanta Fine Homes Sotheby's International Realty fully supports the principles of the Fair Housing Act and the Equal Opportunity Act. Each office is independently owned and operated. Any services or products provided by independently owned and operated franchisees are not provided by, affiliated with or related to Sotheby's International Realty Affiliates LLC nor any of its affiliated companies.
          </p>

          {/* Logos */}
          <div className="flex items-center gap-4 mb-8">
            <div className="text-white/80 text-xs font-semibold">
              REALTOR®
            </div>
            <div className="text-white/80 text-xs font-semibold">
              EQUAL HOUSING OPPORTUNITY
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <div>
            <p>Copyright © {currentYear} | <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></p>
          </div>
        </div>
      </div>
    </footer>
  );
};
