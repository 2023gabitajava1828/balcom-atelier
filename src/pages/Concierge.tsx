import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  UtensilsCrossed, 
  Car, 
  Ticket, 
  Home, 
  Sparkles,
  Clock, 
  Bell, 
  CheckCircle,
  ArrowRight,
  Quote
} from "lucide-react";
import { RequestForm } from "@/components/concierge/RequestForm";
import { RequestsList } from "@/components/concierge/RequestsList";
import { PerfectLiveChat } from "@/components/concierge/PerfectLiveChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Plane,
    title: "Travel & Aviation",
    description: "Private jets, first-class bookings, and luxury hotel reservations worldwide",
    examples: [
      "Last-minute Gulfstream G650 to Aspen",
      "Aman Tokyo suite during cherry blossom season",
      "Private yacht charter in the Amalfi Coast"
    ]
  },
  {
    icon: UtensilsCrossed,
    title: "Dining & Entertainment",
    description: "Exclusive reservations at the world's most sought-after establishments",
    examples: [
      "Table at Eleven Madison Park, same week",
      "Private dining room at Nobu for 20 guests",
      "Chef's table experience at a Michelin 3-star"
    ]
  },
  {
    icon: Car,
    title: "Transportation",
    description: "24/7 luxury ground transportation and chauffeur services",
    examples: [
      "Maybach airport transfer in Dubai",
      "Ferrari rental for Monaco Grand Prix weekend",
      "Multi-city chauffeur service across Europe"
    ]
  },
  {
    icon: Ticket,
    title: "Events & Access",
    description: "VIP access to sold-out events, courtside seats, and exclusive experiences",
    examples: [
      "Front row at Fashion Week Paris",
      "Courtside Lakers playoffs, Game 7",
      "Private box at the Kentucky Derby"
    ]
  },
  {
    icon: Home,
    title: "Real Estate & Relocation",
    description: "Property viewings, temporary housing, and seamless relocation support",
    examples: [
      "Off-market penthouse viewing in Manhattan",
      "Furnished luxury rental while renovating",
      "Complete relocation package: Atlanta to Dubai"
    ]
  },
  {
    icon: Sparkles,
    title: "Lifestyle & Wellness",
    description: "Personal shopping, spa retreats, and curated wellness experiences",
    examples: [
      "Hermès Birkin sourcing in Paris",
      "Private wellness retreat in Bali",
      "Same-day appointment with top specialist"
    ]
  }
];

const successStories = [
  {
    quote: "They secured courtside seats to Game 7 with 4 hours notice. Impossible made possible.",
    client: "Tech Founder, Atlanta",
    service: "Events"
  },
  {
    quote: "My wife's dream anniversary trip to Kyoto—every detail was perfect, down to the private tea ceremony.",
    client: "Private Equity Partner, Miami",
    service: "Travel"
  },
  {
    quote: "Found our dream penthouse before it hit the market. That's the Balcom Privé difference.",
    client: "Professional Athlete, Dubai",
    service: "Real Estate"
  }
];

const Concierge = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="page-main-compact">
        {/* Hero Section */}
        <section className="section-hero bg-gradient-to-b from-background to-card/30">
          <div className="content-container">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Available 24/7
              </Badge>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="gradient-text-gold">White-Glove</span> Concierge
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Your dedicated lifestyle partner. From the impossible to the impeccable, 
                we make it happen.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 text-center bg-card/50 border-border/50 hover:border-primary/30 transition-elegant">
                <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">24/7 Availability</h3>
                <p className="text-sm text-muted-foreground">Round-the-clock support for your needs</p>
              </Card>
              <Card className="p-6 text-center bg-card/50 border-border/50 hover:border-primary/30 transition-elegant">
                <Bell className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">Personal Service</h3>
                <p className="text-sm text-muted-foreground">Dedicated team who knows your preferences</p>
              </Card>
              <Card className="p-6 text-center bg-card/50 border-border/50 hover:border-primary/30 transition-elegant">
                <CheckCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">Vetted Partners</h3>
                <p className="text-sm text-muted-foreground">Only the finest service providers</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Showcase */}
        <section className="section bg-card/30">
          <div className="content-container">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
                What We <span className="gradient-text-gold">Handle</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From securing impossible reservations to orchestrating seamless relocations, 
                our specialists make it happen.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <Card 
                  key={service.title}
                  className="p-6 bg-card border-border/50 hover:border-primary/30 transition-elegant group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-fast">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-fast">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pl-[60px]">
                    {service.examples.map((example, i) => (
                      <div 
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <ArrowRight className="w-3 h-3 text-primary/60 shrink-0" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="section">
          <div className="content-container">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Member <span className="gradient-text-gold">Stories</span>
              </h2>
              <p className="text-muted-foreground">
                Real results from our concierge team
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {successStories.map((story, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-card/50 border-border/50 hover:border-primary/30 transition-elegant animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-foreground italic mb-4 leading-relaxed">
                    "{story.quote}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{story.client}</span>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {story.service}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Request Section */}
        <section className="section bg-card/30">
          <div className="content-container">
            {user ? (
              <Tabs defaultValue="new" className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    Submit a <span className="gradient-text-gold">Request</span>
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Tell us what you need—our team will handle the rest
                  </p>
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                    <TabsTrigger value="new">New Request</TabsTrigger>
                    <TabsTrigger value="history">My Requests</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="new">
                  <RequestForm />
                </TabsContent>
                <TabsContent value="history">
                  <RequestsList />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Card className="inline-block p-8 md:p-12 bg-card border-border/50 max-w-lg">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    Ready to Experience <span className="gradient-text-gold">White-Glove</span> Service?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Join Balcom Privé to access our full concierge services
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/auth">
                      <Button size="lg" className="w-full sm:w-auto">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/membership">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        View Membership
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
      
      {/* PerfectLive 24/7 Chat for Gold+ members */}
      <PerfectLiveChat />
    </div>
  );
};

export default Concierge;
