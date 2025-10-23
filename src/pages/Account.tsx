import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Settings, CreditCard, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Account = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                Your <span className="gradient-text-gold">Account</span>
              </h1>
              <p className="text-xl text-foreground/70">
                Manage your profile and membership
              </p>
            </div>

            {/* Auth Required Message */}
            <div className="text-center py-12">
              <Card className="p-12 max-w-md mx-auto">
                <LogIn className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="font-serif text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-foreground/70 mb-6">
                  Please sign in to access your account dashboard
                </p>
                <div className="space-y-3">
                  <Button variant="hero" size="lg" className="w-full">
                    Sign In
                  </Button>
                  <Link to="/membership">
                    <Button variant="premium" size="lg" className="w-full">
                      Become a Member
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Account;
