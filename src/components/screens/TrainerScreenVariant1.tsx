import { useState } from "react";
import { MessageCircle, Camera, Mic, Send, Sparkles, Heart, Brain, Trophy } from "lucide-react";
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

// Variant 1: Card-Based Welcome with Action Categories
export function TrainerScreenVariant1() {
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

  const sendSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const quickActions = [
    {
      icon: Brain,
      title: "Training Help",
      description: "Get personalized training advice",
      prompt: `Help me train ${currentDog?.name || 'my dog'} with basic commands`
    },
    {
      icon: Heart,
      title: "Behavior Issues", 
      description: "Address problematic behaviors",
      prompt: `My dog ${currentDog?.name || ''} has behavior issues I need help with`
    },
    {
      icon: Trophy,
      title: "Advanced Tricks",
      description: "Teach impressive new tricks",
      prompt: `What advanced tricks can I teach ${currentDog?.name || 'my dog'}?`
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Kahu</h1>
          <p className="text-sm text-muted-foreground">Your compassionate AI dog trainer</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 safe-bottom">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="p-6 space-y-6">
            {/* Hero Section */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
                <img 
                  src={heroImage} 
                  alt="Happy dog"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Hello! I'm here to help with {currentDog?.name || 'your dog'} 🐕
              </h2>
              <p className="text-muted-foreground text-sm">
                What would you like to work on today?
              </p>
            </div>

            {/* Quick Action Cards */}
            <div className="grid gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={index}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => sendSuggestedPrompt(action.prompt)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Recent Topics */}
            <Card className="p-4">
              <h3 className="font-medium text-foreground mb-3">Popular Questions</h3>
              <div className="space-y-2">
                {[
                  "House training tips",
                  "Leash walking techniques",
                  "Reducing excessive barking"
                ].map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => sendSuggestedPrompt(`Help me with ${topic.toLowerCase()}`)}
                    className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    • {topic}
                  </button>
                ))}
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
      <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about training..."
              className="resize-none"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-primary px-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}