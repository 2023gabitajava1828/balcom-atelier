import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Bell, Clock, CheckCircle } from "lucide-react";
import { RequestForm } from "@/components/concierge/RequestForm";
import { RequestsList } from "@/components/concierge/RequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Concierge = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                <span className="gradient-text-gold">White-Glove</span> Concierge
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Your dedicated lifestyle partner, available 24/7
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <Card className="p-6 text-center">
                <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">24/7 Availability</h3>
                <p className="text-sm text-foreground/60">Round-the-clock support for your needs</p>
              </Card>
              <Card className="p-6 text-center">
                <Bell className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Personal Service</h3>
                <p className="text-sm text-foreground/60">Dedicated team who knows your preferences</p>
              </Card>
              <Card className="p-6 text-center">
                <CheckCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Vetted Partners</h3>
                <p className="text-sm text-foreground/60">Only the finest service providers</p>
              </Card>
            </div>

            {user ? (
              <Tabs defaultValue="new" className="max-w-6xl mx-auto">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="new">New Request</TabsTrigger>
                  <TabsTrigger value="history">My Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="new">
                  <RequestForm />
                </TabsContent>
                <TabsContent value="history">
                  <RequestsList />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Card className="inline-block p-8 bg-muted/50">
                  <h2 className="font-serif text-2xl font-bold mb-2">Members Only</h2>
                  <p className="text-foreground/70 mb-6">
                    Please log in to access concierge services
                  </p>
                  <Link to="/auth">
                    <Button variant="hero" size="lg">
                      Login / Sign Up
                    </Button>
                  </Link>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Concierge;
