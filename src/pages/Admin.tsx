import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Calendar, FileText, Settings } from "lucide-react";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                <span className="gradient-text-gold">Admin</span> Dashboard
              </h1>
              <p className="text-xl text-foreground/70">
                Manage members, requests, and content
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 hover:shadow-gold transition-elegant">
                <Users className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Members</h3>
                <p className="text-sm text-foreground/60 mb-4">Manage member accounts and tiers</p>
                <Button variant="premium" size="sm" className="w-full">
                  View Members
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-gold transition-elegant">
                <FileText className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Concierge Requests</h3>
                <p className="text-sm text-foreground/60 mb-4">Review and assign requests</p>
                <Button variant="premium" size="sm" className="w-full">
                  View Requests
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-gold transition-elegant">
                <Calendar className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Events</h3>
                <p className="text-sm text-foreground/60 mb-4">Create and manage events</p>
                <Button variant="premium" size="sm" className="w-full">
                  Manage Events
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-gold transition-elegant">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Properties</h3>
                <p className="text-sm text-foreground/60 mb-4">IDX sync and listings</p>
                <Button variant="premium" size="sm" className="w-full">
                  View Properties
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-gold transition-elegant">
                <FileText className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Lookbooks</h3>
                <p className="text-sm text-foreground/60 mb-4">Style curation management</p>
                <Button variant="premium" size="sm" className="w-full">
                  Create Lookbook
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-gold transition-elegant">
                <Settings className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Settings</h3>
                <p className="text-sm text-foreground/60 mb-4">System configuration</p>
                <Button variant="premium" size="sm" className="w-full">
                  Configure
                </Button>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Card className="inline-block p-6 bg-muted/50">
                <p className="text-sm text-foreground/70">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin authentication and full functionality coming with Lovable Cloud
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
