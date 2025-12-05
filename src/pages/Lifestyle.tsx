import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Gavel, MessageSquare, ExternalLink } from "lucide-react";
import { CategoryFilter } from "@/components/luxury/CategoryFilter";
import { LuxuryItemCard } from "@/components/luxury/LuxuryItemCard";
import { ItemDetailModal } from "@/components/luxury/ItemDetailModal";
import { LuxuryItemSkeleton, SkeletonGrid } from "@/components/ui/skeletons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LuxuryItem {
  id: string;
  type: "shopping" | "auction";
  title: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number | null;
  estimate_low: number | null;
  estimate_high: number | null;
  auction_house: string | null;
  auction_date: string | null;
  images: string[] | null;
  featured: boolean | null;
  provenance: string | null;
  details: Record<string, unknown> | null;
}

const Lifestyle = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const navigate = useNavigate();

  // Fetch shopping items
  const { data: shoppingItems = [], isLoading: shoppingLoading } = useQuery({
    queryKey: ["luxury-items", "shopping", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("luxury_items")
        .select("*")
        .eq("type", "shopping")
        .eq("status", "active")
        .order("featured", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LuxuryItem[];
    },
  });

  // Fetch auction items
  const { data: auctionItems = [], isLoading: auctionLoading } = useQuery({
    queryKey: ["luxury-items", "auction", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("luxury_items")
        .select("*")
        .eq("type", "auction")
        .eq("status", "active")
        .order("auction_date", { ascending: true });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LuxuryItem[];
    },
  });

  const categories = ["Fashion", "Watches", "Jewelry", "Art", "Wine", "Collectibles"];

  const handleInquire = (item: LuxuryItem) => {
    navigate("/concierge", { 
      state: { 
        prefill: {
          category: item.type === "auction" ? "Auction Inquiry" : "Shopping Inquiry",
          title: `Inquiry: ${item.title}`,
          description: `I'm interested in ${item.title} by ${item.brand || "Unknown"}.`
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />

      <main className="page-main-compact">
        {/* Hero Section */}
        <section className="section-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="content-container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Curated <span className="gradient-text-gold">Lifestyle</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Exceptional pieces and rare auction lots, hand-selected for the discerning collector
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section content-container">
          <Tabs defaultValue="shopping" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <TabsList className="bg-card/50 border border-border/50 p-1 w-fit">
                <TabsTrigger 
                  value="shopping" 
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shopping
                </TabsTrigger>
                <TabsTrigger 
                  value="auction" 
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Gavel className="w-4 h-4" />
                  Auction
                </TabsTrigger>
              </TabsList>

              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>

            <TabsContent value="shopping" className="mt-0">
              {shoppingLoading ? (
                <SkeletonGrid 
                  count={8} 
                  Component={LuxuryItemSkeleton} 
                  className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                />
              ) : shoppingItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {shoppingItems.map((item) => (
                    <LuxuryItemCard
                      key={item.id}
                      item={item}
                      onInquire={handleInquire}
                      onViewDetails={setSelectedItem}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center bg-card/50 border-border/50">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Collection Coming Soon
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Our curators are selecting exceptional pieces for this category
                  </p>
                  <Link to="/concierge">
                    <Button variant="outline" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Request Specific Item
                    </Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="auction" className="mt-0">
              {auctionLoading ? (
                <SkeletonGrid 
                  count={8} 
                  Component={LuxuryItemSkeleton} 
                  className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                />
              ) : auctionItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {auctionItems.map((item) => (
                    <LuxuryItemCard
                      key={item.id}
                      item={item}
                      onInquire={handleInquire}
                      onViewDetails={setSelectedItem}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center bg-card/50 border-border/50">
                  <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Upcoming Auctions
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Our specialists are curating lots from premier auction houses
                  </p>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="https://www.sothebys.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Browse Sotheby's
                    </a>
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Concierge CTA */}
        <section className="section-sm content-container">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-card to-card/80 border-primary/20">
            <div className="max-w-2xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Concierge Service
              </Badge>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our concierge team specializes in sourcing rare and exclusive items worldwide. 
                From vintage timepieces to contemporary art, we'll find it for you.
              </p>
              <Link to="/concierge">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Concierge
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      <Footer className="hidden md:block" />
      <BottomTabs />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Lifestyle;
