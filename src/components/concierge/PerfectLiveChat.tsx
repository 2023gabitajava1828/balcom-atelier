import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, X, Send, Phone, Video, MoreVertical, 
  Headphones, Clock, CheckCircle2, Sparkles 
} from "lucide-react";
import { useMembership, TIER_LABELS, MembershipTier } from "@/hooks/useMembership";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

export const PerfectLiveChat = () => {
  const { user } = useAuth();
  const { tier, canAccessTier } = useMembership();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPaidTier = canAccessTier("gold");
  const agentName = "Alexandra";
  const agentRole = "Lifestyle Concierge";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsConnected(true);
    setIsConnecting(false);
    
    // Add welcome message
    setMessages([{
      id: "welcome",
      role: "agent",
      content: `Good ${getTimeOfDay()}, ${user?.user_metadata?.first_name || "there"}! I'm ${agentName}, your dedicated lifestyle concierge. How may I assist you today?`,
      timestamp: new Date()
    }]);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help with that. Let me look into the best options for you.",
        "Excellent choice! I'll coordinate this immediately and follow up with confirmation details.",
        "I understand completely. Allow me to make some calls and I'll have this arranged within the hour.",
        "Absolutely. I have several exclusive connections that would be perfect for this request.",
        "Consider it done. I'll send you all the details via email shortly."
      ];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Not logged in or not paid tier - don't show
  if (!user || !isPaidTier) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 animate-fade-in"
        >
          <Headphones className="w-5 h-5" />
          <span className="font-medium">24/7 Concierge</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-[360px] md:w-[400px] h-[500px] md:h-[560px] flex flex-col overflow-hidden shadow-2xl border-border/50 animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-primary" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    PerfectLive Concierge
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {TIER_LABELS[tier]}
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isConnected ? `${agentName} • ${agentRole}` : "Available 24/7"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isConnected && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {!isConnected ? (
              /* Connection Screen */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">White-Glove Service</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
                  Connect with a dedicated concierge for personalized assistance with travel, dining, events, and more.
                </p>
                
                <div className="space-y-3 w-full max-w-[240px] mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Available 24 hours a day</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Response within 60 seconds</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Exclusive member benefits</span>
                  </div>
                </div>

                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="w-full max-w-[240px] gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Start Live Chat
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-muted-foreground mt-4">
                  Powered by PerfectLive • Encrypted & Secure
                </p>
              </div>
            ) : (
              /* Chat Interface */
              <>
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border/50 bg-card">
                  <div className="flex items-center gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Average response time: &lt;60 seconds
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
