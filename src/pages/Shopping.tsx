import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { LuxuryItemCard } from "@/components/luxury/LuxuryItemCard";
import { ItemDetailModal } from "@/components/luxury/ItemDetailModal";
import { CategoryFilter } from "@/components/luxury/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles } from "lucide-react";

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

const SHOPPING_CATEGORIES = ["Fashion", "Watches", "Jewelry", "Home & Art", "Accessories", "Wine & Spirits"];

const Shopping = () => {
  const [items, setItems] = useState<LuxuryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("luxury_items")
        .select("*")
        .eq("type", "shopping")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems((data as LuxuryItem[]) || []);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
      toast({
        title: "Error",
        description: "Failed to load shopping items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === "All" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleInquire = (item: LuxuryItem) => {
    navigate("/concierge", { 
      state: { 
        prefill: {
          category: "Shopping Inquiry",
          title: `Inquiry: ${item.title}`,
          description: `I'm interested in purchasing ${item.title} by ${item.brand || "Unknown"}. Price: $${item.price?.toLocaleString()}`
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-24 md:pb-8">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center gap-3 mb-6">
              <ShoppingBag className="w-10 h-10 text-primary" />
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Luxury <span className="gradient-text-gold">Shopping</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Curated collection of the world's finest luxury goods. Each piece selected for discerning collectors and connoisseurs.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <CategoryFilter 
            categories={SHOPPING_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        {/* Items Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {selectedCategory !== "All" 
                  ? `No items in ${selectedCategory} category yet.`
                  : "Check back soon for new luxury items."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <LuxuryItemCard
                  key={item.id}
                  item={item}
                  onInquire={handleInquire}
                  onViewDetails={setSelectedItem}
                />
              ))}
            </div>
          )}
        </section>

        {/* Results count */}
        {!loading && filteredItems.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />

      {/* Detail Modal */}
      <ItemDetailModal 
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Shopping;
