import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Settings, CreditCard, LogIn, Mail, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMembership, TIER_LABELS } from "@/hooks/useMembership";
import { useEffect } from "react";

const Account = () => {
  const { user, loading } = useAuth();
  const { tier, loading: membershipLoading } = useMembership();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-20 md:pb-0">
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

            {/* User Profile Card */}
            <Card className="p-8 mb-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {user.user_metadata?.first_name || 'Member'}{' '}
                    {user.user_metadata?.last_name || ''}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Member Status: Active
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/membership" className="block">
                <Card className="p-6 hover:shadow-gold transition-shadow cursor-pointer h-full">
                  <CreditCard className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Membership</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage your membership tier
                  </p>
                </Card>
              </Link>

              <Card className="p-6 hover:shadow-gold transition-shadow cursor-pointer h-full">
                <Settings className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Update your profile and preferences
                </p>
              </Card>

              <Link to="/concierge" className="block">
                <Card className="p-6 hover:shadow-gold transition-shadow cursor-pointer h-full">
                  <User className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Concierge</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your concierge requests
                  </p>
                </Card>
              </Link>
            </div>

            {/* Account Details */}
            <Card className="p-8 mt-6">
              <h3 className="text-xl font-bold mb-6">Account Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Current Tier</span>
                  <span className="font-medium text-primary capitalize">
                    {membershipLoading ? "..." : TIER_LABELS[tier]}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer className="hidden md:block" />
      <BottomTabs />
    </div>
  );
};

export default Account;
