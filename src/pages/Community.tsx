import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl font-bold mb-4">
                Community & <span className="gradient-text-gold">Events</span>
              </h1>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Exclusive gatherings and member experiences
              </p>
            </div>

            <div className="text-center py-20">
              <div className="inline-block p-8 bg-muted/50 rounded-2xl border border-primary/20">
                <div className="flex justify-center gap-4 mb-4">
                  <Calendar className="w-12 h-12 text-primary" />
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">Events Calendar Coming Soon</h2>
                <p className="text-foreground/70 mb-6">
                  RSVP to exclusive member events and experiences
                </p>
                <Button variant="premium" size="lg">
                  View Upcoming Events
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Community;
