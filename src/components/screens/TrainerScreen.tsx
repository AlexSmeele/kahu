import { useState } from "react";
import { MessageCircle, Camera, Mic, Send, Sparkles, Bookmark, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDogs } from "@/hooks/useDogs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";
import { useSavedMessages } from "@/hooks/useSavedMessages";
import { useMessageReports } from "@/hooks/useMessageReports";
import { SaveMessageModal } from "@/components/modals/SaveMessageModal";
import { ReportMessageModal } from "@/components/modals/ReportMessageModal";

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
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const { dogs } = useDogs();
  const { toast } = useToast();
  const { saveMessage } = useSavedMessages();
  const { reportMessage } = useMessageReports();
  const currentDog = dogs[0]; // Use first dog as default

  const handleSaveMessage = (message: Message) => {
    setSelectedMessage(message);
    setSaveModalOpen(true);
  };

  const handleReportMessage = (message: Message) => {
    setSelectedMessage(message);
    setReportModalOpen(true);
  };

  const onSaveMessage = async (tags: string[], notes: string) => {
    if (!selectedMessage) return;
    
    try {
      await saveMessage(
        selectedMessage.content,
        currentDog?.id || null,
        {
          conversation: messages.slice(0, messages.indexOf(selectedMessage) + 1),
          timestamp: selectedMessage.timestamp,
        },
        tags,
        notes
      );
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const onReportMessage = async (reason: string, details: string) => {
    if (!selectedMessage) return;
    
    try {
      await reportMessage(
        selectedMessage.content,
        reason,
        details,
        currentDog?.id || null,
        {
          conversation: messages.slice(0, messages.indexOf(selectedMessage) + 1),
          timestamp: selectedMessage.timestamp,
        }
      );
    } catch (error) {
      // Error is handled in the hook
    }
  };


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

      {/* Content - Scrollable area that takes remaining space */}
      <div className="flex-1 overflow-y-auto">
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
              Welcome to Kahu!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              I'm here to help you build a stronger bond with {currentDog?.name || 'your dog'} through positive, 
              evidence-based training methods.
            </p>

            {/* Suggested Prompts */}
            <div className="w-full max-w-md pb-6">
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
          <div className="p-4 space-y-4 pb-6">
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Kahu</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveMessage(message)}
                          className="h-7 w-7 p-0 hover:bg-secondary"
                          title="Save message"
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReportMessage(message)}
                          className="h-7 w-7 p-0 hover:bg-secondary"
                          title="Report message"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">You</span>
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

      {/* Input Area - Sticky footer in document flow */}
      <div className="flex-shrink-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about training ${currentDog?.name || 'your dog'}...`}
              className="resize-none"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-10 w-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </Button>
        </div>
      </div>

      <SaveMessageModal
        isOpen={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false);
          setSelectedMessage(null);
        }}
        onSave={onSaveMessage}
        messageContent={selectedMessage?.content || ''}
        isLoading={false}
      />

      <ReportMessageModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedMessage(null);
        }}
        onReport={onReportMessage}
        messageContent={selectedMessage?.content || ''}
        isLoading={false}
      />
    </div>
  );
}