import { useState } from "react";
import { MessageCircle, Camera, Mic, Send, Sparkles } from "lucide-react";
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

export function TrainerScreen({ onTypingChange }: { onTypingChange?: (typing: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dogs } = useDogs();
  const { toast } = useToast();
  const currentDog = dogs[0]; // Use first dog as default

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
    onTypingChange?.(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-trainer', {
        body: {
          prompt: userMessage.content,
          dogInfo: currentDog,
          userContext: messages.slice(-5), // Send last 5 messages for context
        },
      });

      if (error) {
        throw error;
      }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    onTypingChange?.(value.length > 0);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Kahu</h1>
          <p className="text-sm text-muted-foreground">Your compassionate AI dog trainer</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32 safe-bottom">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex flex-col items-center justify-center p-6 text-center min-h-full">
            <div className="w-full max-w-sm mb-8">
              <img 
                src={heroImage} 
                alt="Happy dog in training session"
                className="w-full h-48 object-cover rounded-2xl shadow-[var(--shadow-medium)]"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Welcome to Kahu! 🐕
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              I'm here to help you build a stronger bond with {currentDog?.name || 'your dog'} through positive, 
              evidence-based training methods.
            </p>

            {/* Suggested Prompts */}
            <div className="w-full max-w-md">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="space-y-2">
                {[
                  `My dog ${currentDog?.name || ''} won't come when called`,
                  "Help with house training",
                  "Teaching my puppy to sit"
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendSuggestedPrompt(prompt)}
                    className="w-full text-left p-3 bg-secondary rounded-lg text-sm text-secondary-foreground hover:bg-secondary-hover transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
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
                      <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Kahu</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-card border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
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

      {/* Input Area - Fixed positioning with consistent spacing */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about training ${currentDog?.name || 'your dog'}...`}
              className="h-10"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-10 px-3"
            size="default"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="default" className="flex-1 h-10" disabled>
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button variant="outline" size="default" className="flex-1 h-10" disabled>
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </Button>
        </div>
      </div>
    </div>
  );
}