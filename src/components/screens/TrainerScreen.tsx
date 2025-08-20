import { MessageCircle, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

export function TrainerScreen() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Kahu AI Trainer</h1>
            <p className="text-sm text-muted-foreground">Your compassionate dog training guide</p>
          </div>
        </div>
      </header>

      {/* Welcome State */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
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
          I'm here to help you build a stronger bond with your dog through positive, 
          evidence-based training methods.
        </p>

        <div className="space-y-3 w-full max-w-sm">
          <Button className="btn-primary w-full">
            <MessageCircle className="w-5 h-5 mr-2" />
            Start a Conversation
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Camera className="w-5 h-5 mr-2" />
              Upload Photo
            </Button>
            <Button variant="outline" className="flex-1">
              <Mic className="w-5 h-5 mr-2" />
              Voice Message
            </Button>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mt-8 w-full max-w-md">
          <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
          <div className="space-y-2">
            {[
              "My dog won't come when called",
              "Help with house training",
              "Teaching my puppy to sit"
            ].map((prompt, index) => (
              <button
                key={index}
                className="w-full text-left p-3 bg-secondary rounded-lg text-sm text-secondary-foreground hover:bg-secondary-hover transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}