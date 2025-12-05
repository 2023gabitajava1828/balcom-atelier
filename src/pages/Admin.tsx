import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Calendar, FileText, Settings, Home, RefreshCw, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ConciergeRequestsManager } from "@/components/admin/ConciergeRequestsManager";
import { AddPropertyModal } from "@/components/admin/AddPropertyModal";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    members: 0,
    requests: 0,
    events: 0,
    properties: 0,
    luxuryItems: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [dubaiProperties, setDubaiProperties] = useState<any[]>([]);
  const [luxuryItems, setLuxuryItems] = useState<any[]>([]);
  const [isSyncingSothebys, setIsSyncingSothebys] = useState(false);
  const [isSyncingChristies, setIsSyncingChristies] = useState(false);
  const [isSyncingBayut, setIsSyncingBayut] = useState(false);
  const [isSyncingSothebysItems, setIsSyncingSothebysItems] = useState(false);
  const [isSyncingWithDetails, setIsSyncingWithDetails] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchEvents();
    fetchDubaiProperties();
    fetchLuxuryItems();
  }, []);

  const fetchStats = async () => {
    const [membersRes, requestsRes, eventsRes, propertiesRes, luxuryRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("concierge_requests").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("luxury_items").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      members: membersRes.count || 0,
      requests: requestsRes.count || 0,
      events: eventsRes.count || 0,
      properties: propertiesRes.count || 0,
      luxuryItems: luxuryRes.count || 0,
    });
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .limit(10);

    if (data) setEvents(data);
  };

  const fetchDubaiProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("city", "Dubai")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setDubaiProperties(data);
  };

  const fetchLuxuryItems = async () => {
    const { data } = await supabase
      .from("luxury_items")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setLuxuryItems(data);
  };

  const handleSyncSothebys = async () => {
    setIsSyncingSothebys(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-sothebys-dubai', {
        body: { action: 'sync' }
      });

      if (error) throw error;

      toast({
        title: "Sotheby's Dubai Synced",
        description: `Scraped ${data.scraped} properties. Inserted: ${data.inserted}, Updated: ${data.updated}`,
      });

      setLastSync(new Date().toISOString());
      fetchDubaiProperties();
      fetchStats();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Sotheby's properties",
        variant: "destructive",
      });
    } finally {
      setIsSyncingSothebys(false);
    }
  };

  const handleSyncChristies = async () => {
    setIsSyncingChristies(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-christies-dubai', {
        body: { action: 'sync' }
      });

      if (error) throw error;

      toast({
        title: "Christie's Dubai Synced",
        description: `Scraped ${data.scraped} properties. Inserted: ${data.inserted}, Updated: ${data.updated}`,
      });

      setLastSync(new Date().toISOString());
      fetchDubaiProperties();
      fetchStats();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Christie's properties",
        variant: "destructive",
      });
    } finally {
      setIsSyncingChristies(false);
    }
  };

  const handleSyncBayut = async () => {
    setIsSyncingBayut(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-bayut-dubai', {
        body: { action: 'sync' }
      });

      if (error) throw error;

      toast({
        title: "Bayut Dubai Synced",
        description: `Found ${data.urlsFound} URLs, scraped ${data.propertiesScraped} properties. Inserted: ${data.inserted}, Updated: ${data.updated}`,
      });

      setLastSync(new Date().toISOString());
      fetchDubaiProperties();
      fetchStats();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Bayut properties",
        variant: "destructive",
      });
    } finally {
      setIsSyncingBayut(false);
    }
  };

  const handleSyncSothebysItems = async (withDetails: boolean = false) => {
    if (withDetails) {
      setIsSyncingWithDetails(true);
    } else {
      setIsSyncingSothebysItems(true);
    }
    try {
      const { data, error } = await supabase.functions.invoke('scrape-sothebys-items', {
        body: { 
          action: 'sync',
          fetchDetails: withDetails,
          limit: withDetails ? 20 : 0 // Limit when fetching details to avoid timeout
        }
      });

      if (error) throw error;

      const detailsMsg = withDetails && data.detailsFetched 
        ? ` Details fetched: ${data.detailsFetched}.`
        : '';
      
      toast({
        title: "Sotheby's Items Synced",
        description: `Scraped ${data.categoriesScraped} categories. Found ${data.itemsFound} items. Inserted: ${data.inserted}, Updated: ${data.updated}.${detailsMsg}`,
      });

      setLastSync(new Date().toISOString());
      fetchLuxuryItems();
      fetchStats();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Sotheby's items",
        variant: "destructive",
      });
    } finally {
      setIsSyncingSothebysItems(false);
      setIsSyncingWithDetails(false);
    }
  };

  const handleDeleteLuxuryItem = async (itemId: string, itemTitle: string) => {
    try {
      const { error } = await supabase
        .from("luxury_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Item Deleted",
        description: `"${itemTitle}" has been removed.`,
      });

      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      fetchLuxuryItems();
      fetchStats();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const { error } = await supabase
        .from("luxury_items")
        .delete()
        .in("id", Array.from(selectedItems));

      if (error) throw error;

      toast({
        title: "Items Deleted",
        description: `${selectedItems.size} items have been removed.`,
      });

      setSelectedItems(new Set());
      fetchLuxuryItems();
      fetchStats();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete items",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === luxuryItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(luxuryItems.map(item => item.id)));
    }
  };

  return (
    <AdminGuard>
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

              {/* Stats Overview */}
              <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-12">
                <Card className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.members}</div>
                  <p className="text-sm text-foreground/60">Total Members</p>
                </Card>
                <Card className="p-6 text-center">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.requests}</div>
                  <p className="text-sm text-foreground/60">Concierge Requests</p>
                </Card>
                <Card className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.events}</div>
                  <p className="text-sm text-foreground/60">Events</p>
                </Card>
                <Card className="p-6 text-center">
                  <Home className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.properties}</div>
                  <p className="text-sm text-foreground/60">Properties</p>
                </Card>
                <Card className="p-6 text-center">
                  <ShoppingBag className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{stats.luxuryItems}</div>
                  <p className="text-sm text-foreground/60">Luxury Items</p>
                </Card>
              </div>

              {/* Management Tabs */}
              <Tabs defaultValue="requests" className="max-w-6xl mx-auto">
                <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 mb-8">
                  <TabsTrigger value="requests">Concierge</TabsTrigger>
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="luxury">Luxury Items</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="requests">
                  <ConciergeRequestsManager />
                </TabsContent>

                <TabsContent value="properties">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold">Dubai Properties</h2>
                        <p className="text-sm text-foreground/60 mt-1">
                          Sync properties from sothebysrealty.ae
                          {lastSync && ` • Last synced: ${format(new Date(lastSync), "PPp")}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSyncSothebys} 
                          disabled={isSyncingSothebys || isSyncingChristies || isSyncingBayut}
                          variant="hero"
                          size="sm"
                        >
                          {isSyncingSothebys ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sotheby's
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={handleSyncChristies} 
                          disabled={isSyncingSothebys || isSyncingChristies || isSyncingBayut}
                          variant="outline"
                          size="sm"
                        >
                          {isSyncingChristies ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Christie's
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={handleSyncBayut} 
                          disabled={isSyncingSothebys || isSyncingChristies || isSyncingBayut}
                          variant="outline"
                          size="sm"
                        >
                          {isSyncingBayut ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Bayut
                            </>
                          )}
                        </Button>
                        <AddPropertyModal onSuccess={() => { fetchDubaiProperties(); fetchStats(); }} />
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {dubaiProperties.length === 0 ? (
                        <div className="text-center py-12 text-foreground/60">
                          <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No Dubai properties yet. Click "Sync Dubai Properties" to import from Sotheby's.</p>
                        </div>
                      ) : (
                        dubaiProperties.map((property) => (
                          <Card key={property.id} className="p-4">
                            <div className="flex items-start gap-4">
                              {property.images?.[0] && (
                                <img 
                                  src={property.images[0]} 
                                  alt={property.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{property.title}</h3>
                                <p className="text-sm text-foreground/70 line-clamp-2 mb-2">
                                  {property.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-foreground/60">
                                  <Badge variant="secondary">
                                    ${property.price?.toLocaleString()}
                                  </Badge>
                                  {property.bedrooms && <span>{property.bedrooms} beds</span>}
                                  {property.bathrooms && <span>{property.bathrooms} baths</span>}
                                  {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="luxury">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold">Sotheby's Luxury Items</h2>
                        <p className="text-sm text-foreground/60 mt-1">
                          Curated items from Sotheby's Buy Now catalog
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSyncSothebysItems(false)} 
                          disabled={isSyncingSothebysItems || isSyncingWithDetails}
                          variant="hero"
                          size="sm"
                        >
                          {isSyncingSothebysItems ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Quick Sync
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleSyncSothebysItems(true)} 
                          disabled={isSyncingSothebysItems || isSyncingWithDetails}
                          variant="outline"
                          size="sm"
                        >
                          {isSyncingWithDetails ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Fetching Details...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync + Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {luxuryItems.length > 0 && (
                      <div className="flex items-center justify-between p-3 mb-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedItems.size === luxuryItems.length && luxuryItems.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                          <span className="text-sm text-foreground/70">
                            {selectedItems.size > 0 
                              ? `${selectedItems.size} of ${luxuryItems.length} selected`
                              : `Select all (${luxuryItems.length} items)`
                            }
                          </span>
                        </div>
                        {selectedItems.size > 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isBulkDeleting}
                              >
                                {isBulkDeleting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete {selectedItems.size} Items
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {selectedItems.size} Items</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {selectedItems.size} selected items? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleBulkDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete All
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )}
                    
                    <div className="grid gap-4">
                      {luxuryItems.length === 0 ? (
                        <div className="text-center py-12 text-foreground/60">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No luxury items yet. Click "Sync Sotheby's" to import from their catalog.</p>
                        </div>
                      ) : (
                        luxuryItems.map((item) => (
                          <Card key={item.id} className={`p-4 transition-colors ${selectedItems.has(item.id) ? 'bg-primary/5 border-primary/30' : ''}`}>
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={selectedItems.has(item.id)}
                                onCheckedChange={() => toggleSelectItem(item.id)}
                                className="mt-1"
                              />
                              {item.images?.[0] && (
                                <img 
                                  src={item.images[0]} 
                                  alt={item.title}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                {item.brand && (
                                  <p className="text-xs text-primary uppercase tracking-wider mb-1">{item.brand}</p>
                                )}
                                <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-foreground/60">
                                  {item.price && (
                                    <Badge variant="secondary">
                                      ${item.price.toLocaleString()}
                                    </Badge>
                                  )}
                                  <span>{item.category}</span>
                                  {item.auction_house && <span>{item.auction_house}</span>}
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteLuxuryItem(item.id, item.title)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="events">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-2xl font-bold">Events</h2>
                      <Button variant="hero">Create Event</Button>
                    </div>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <Card key={event.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{event.title}</h3>
                              <p className="text-sm text-foreground/70 mb-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-xs text-foreground/60">
                                <span>{format(new Date(event.event_date), "PPP")}</span>
                                <span>{event.city}</span>
                                {event.capacity && <span>{event.capacity} capacity</span>}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
      </div>
    </AdminGuard>
  );
};

export default Admin;
