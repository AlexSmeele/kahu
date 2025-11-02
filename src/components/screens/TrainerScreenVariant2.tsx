import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDogs } from "@/hooks/useDogs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Variant 2: Minimalist Search-Focused Design
export function TrainerScreenVariant2({ onTypingChange }: { onTypingChange?: (typing: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { dogs } = useDogs();
  const { toast } = useToast();
  const currentDog = dogs[0];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const quickSuggestions = [
    "Basic training tips",
    "Stop excessive barking", 
    "Leash training help",
    "Socialization advice",
    "House training"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Clean Welcome State */
          <div className="flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-8">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
            
            <h2 className="text-xl font-medium text-foreground mb-3">
              What can I help you with today?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Ask me anything about training {currentDog?.name || 'your dog'}. 
              I'm your AI dog care adviser.
            </p>

            {/* Search-style input */}
            <div className="w-full max-w-md mb-6">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask about training, behavior, or care..."
                className="h-12 text-center"
                disabled={isLoading}
                autoFocus
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-full mt-3 h-10"
              >
                Get Help
              </Button>
            </div>

            {/* Quick suggestions */}
            <div className="w-full max-w-md">
              <p className="text-xs text-muted-foreground mb-3">Popular topics:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="px-3 py-1 text-xs bg-secondary hover:bg-secondary-hover text-secondary-foreground rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation View */
          <div className="max-w-2xl mx-auto p-4 pt-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>Kahu</span>
                  </div>
                )}
                <div className={`${
                  message.role === 'user' 
                    ? 'ml-8 text-right' 
                    : 'mr-8'
                }`}>
                  <div className={`inline-block p-4 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Kahu</span>
                </div>
                <div className="inline-block p-4 rounded-2xl bg-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Input (when in conversation) */}
      {messages.length > 0 && (
        <div className="p-4 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-2 items-end">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Continue the conversation..."
                disabled={isLoading}
                autoFocus
              />
            </div>
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