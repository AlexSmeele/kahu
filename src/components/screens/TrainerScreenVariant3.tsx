import { useState } from "react";
import { MessageCircle, Send, Sparkles, Clock, TrendingUp, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDogs } from "@/hooks/useDogs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Variant 3: Dashboard-Style with Stats and Quick Actions
export function TrainerScreenVariant3({ onTypingChange }: { onTypingChange?: (typing: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dogs } = useDogs();
  const { toast } = useToast();
  const currentDog = dogs[0];

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-trainer', {
        body: {
          prompt: userMessage.content,
          dogInfo: currentDog,
          userContext: messages.slice(-5),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again in a moment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    onTypingChange?.(value.length > 0);
  };

  const stats = [
    { label: "Days with Kahu", value: "12", icon: Clock },
    { label: "Questions Asked", value: "24", icon: MessageCircle },
    { label: "Progress Made", value: "85%", icon: TrendingUp },
  ];

  const quickActions = [
    "Daily training routine",
    "Behavior troubleshooting", 
    "Nutrition advice",
    "Exercise recommendations"
  ];

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Kahu</h1>
          <p className="text-sm text-muted-foreground">Your compassionate AI dog trainer</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
        {messages.length === 0 ? (
          /* Dashboard Welcome */
          <div className="p-4 space-y-4">
            {/* Dog Profile Card */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={currentDog?.avatar_url || heroImage} 
                    alt={currentDog?.name || "Dog"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentDog?.name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-foreground">{currentDog?.name || "Your Dog"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {(currentDog as any)?.dog_breeds?.breed || "Mixed Breed"}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Ready to continue training?</p>
                <Button 
                  onClick={() => setInputMessage("What should we work on today?")}
                  className="w-full"
                >
                  Start Training Session
                </Button>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-3 text-center">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Quick Help
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(`Help me with ${action.toLowerCase()}`)}
                    className="text-xs h-auto py-2"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Tips Section */}
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Today's Tip
              </h3>
              <p className="text-sm text-muted-foreground">
                Consistency is key! Try to practice commands for just 5-10 minutes daily 
                rather than long, infrequent sessions.
              </p>
            </Card>

            {/* Ask Anything */}
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3">Ask Kahu Anything</h3>
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask about ${currentDog?.name || 'your dog'}...`}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* Chat Messages */
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border-border'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Kahu</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-card border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Kahu</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      {messages.length > 0 && (
        <div className="p-4 bg-card border-t border-border">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Continue conversation..."
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}