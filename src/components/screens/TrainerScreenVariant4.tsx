import { useState } from "react";
import { MessageCircle, Send, Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

// Variant 4: Magazine/Blog Style Landing
export function TrainerScreenVariant4({ onTypingChange }: { onTypingChange?: (typing: boolean) => void }) {
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

  const featuredTopics = [
    {
      title: "Puppy Training Basics",
      description: "Essential commands every puppy should learn first",
      prompt: "Help me teach basic commands to my puppy"
    },
    {
      title: "Behavioral Solutions", 
      description: "Address common behavioral challenges effectively",
      prompt: "My dog has behavioral issues I need help solving"
    },
    {
      title: "Advanced Training",
      description: "Take your dog's skills to the next level",
      prompt: "What advanced training techniques can I try?"
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 text-center border-b border-border bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Kahu
        </h1>
        <p className="text-muted-foreground text-sm">Your compassionate AI dog trainer</p>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto safe-bottom">
        {messages.length === 0 ? (
          /* Magazine-style Welcome */
          <div className="space-y-0">
            {/* Hero Section */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={heroImage} 
                alt="Happy dog training"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Welcome back! 👋
                </h2>
                <p className="text-sm text-muted-foreground">
                  Let's continue {currentDog?.name || "your dog"}'s training journey
                </p>
              </div>
            </div>

            {/* Quick Question */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="text-lg font-medium text-foreground mb-3 text-center">
                What's on your mind today?
              </h3>
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Featured Content */}
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Featured Training Topics
              </h3>
              
              {featuredTopics.map((topic, index) => (
                <Card 
                  key={index} 
                  className="p-4 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setInputMessage(topic.prompt)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {topic.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Quote/Tip */}
            <div className="p-4 mx-4 bg-accent/20 rounded-lg border-l-4 border-primary">
              <p className="text-sm italic text-foreground">
                "The bond between a dog and their human grows stronger with every moment of understanding and patience shared."
              </p>
              <p className="text-xs text-muted-foreground mt-2">— Kahu's Training Philosophy</p>
            </div>

            {/* Quick Stats */}
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-primary">24/7</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">1000+</div>
                <div className="text-xs text-muted-foreground">Dogs Helped</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">5★</div>
                <div className="text-xs text-muted-foreground">Experience</div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="p-4 space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${
                  message.role === 'user' ? 'order-2' : 'order-1'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Kahu</span>
                    </div>
                  )}
                  <Card className={`p-4 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-card mr-4'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </Card>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Kahu</span>
                  </div>
                  <Card className="p-4 bg-card mr-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Input (in conversation mode) */}
      {messages.length > 0 && (
        <div className="flex-shrink-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Continue the conversation..."
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
        </div>
      )}
    </div>
  );
}