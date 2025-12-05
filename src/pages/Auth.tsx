import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Shield, Globe, Clock, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import heroAtlanta from '@/assets/hero-atlanta.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 6 characters.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, firstName, lastName);

      if (error) {
        toast({
          title: 'Signup failed',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
      } else {
        toast({
          title: 'Welcome to Balcom Privé',
          description: 'Your account has been created.',
        });
        navigate('/');
      }
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
      } else {
        toast({
          title: 'Welcome back',
          description: 'Successfully signed in.',
        });
        navigate('/');
      }
    }
  };

  const trustBadges = [
    { icon: Shield, label: 'Secure & Private' },
    { icon: Globe, label: 'Global Network' },
    { icon: Clock, label: '24/7 Concierge' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Background imagery (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <img
          src={heroAtlanta}
          alt="Luxury property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/40" />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>
          
          {/* Testimonial / Social proof */}
          <div className="max-w-md">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-xl font-serif text-foreground leading-relaxed mb-4">
              "Balcom Privé found us our dream home in Dubai within weeks. Their concierge team handled everything flawlessly."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">MR</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Michael R.</p>
                <p className="text-xs text-muted-foreground">Platinum Member</p>
              </div>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="flex gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2">
                <badge.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        {/* Mobile back button */}
        <Link 
          to="/" 
          className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-eyebrow text-primary tracking-[0.25em] mb-4">BALCOM PRIVÉ</p>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join the Circle'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' 
                ? 'Sign in to access your account' 
                : 'Create your exclusive membership'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label 
                    htmlFor="firstName" 
                    className={cn(
                      "text-sm transition-colors",
                      focusedField === 'firstName' ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    className="h-12 bg-secondary/50 border-border/50 focus:border-primary focus:bg-secondary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label 
                    htmlFor="lastName"
                    className={cn(
                      "text-sm transition-colors",
                      focusedField === 'lastName' ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    className="h-12 bg-secondary/50 border-border/50 focus:border-primary focus:bg-secondary transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label 
                htmlFor="email"
                className={cn(
                  "text-sm transition-colors",
                  focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                className="h-12 bg-secondary/50 border-border/50 focus:border-primary focus:bg-secondary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password"
                className={cn(
                  "text-sm transition-colors",
                  focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary focus:bg-secondary transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base transition-all duration-300 shadow-gold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : "Already a member?"}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Trust footer */}
          <div className="mt-12 pt-8 border-t border-border/30">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-foreground/70 hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              {' '}and{' '}
              <span className="text-foreground/70 hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            </p>
            
            {/* Mobile trust badges */}
            <div className="lg:hidden flex justify-center gap-6 mt-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1">
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
