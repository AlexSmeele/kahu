import { ArrowLeft, GraduationCap, Clock, Award, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GuideIntro() {
  const navigate = useNavigate();

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Pre-Purchase Guide</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="font-bold text-3xl">Are You Dog-Ready?</h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            This comprehensive education course will prepare you for everything that comes with dog ownership. 
            Learn at your own pace, get personalized recommendations, and earn your certification.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">90-120 Minutes</h3>
            <p className="text-sm text-muted-foreground">Complete at your own pace</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Personalized</h3>
            <p className="text-sm text-muted-foreground">Tailored to your lifestyle</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Certified</h3>
            <p className="text-sm text-muted-foreground">Earn your certificate</p>
          </Card>
        </div>

        {/* What You'll Learn */}
        <Card className="p-6">
          <h3 className="font-bold text-xl mb-4">What You'll Learn</h3>
          <ul className="space-y-3">
            {[
              "Understanding the long-term commitment of dog ownership",
              "Financial planning and budgeting for a dog",
              "Choosing the right dog for your lifestyle",
              "Essential care, health, and welfare knowledge",
              "Preparing your home and family",
              "First days and weeks with your new dog"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* CTA Section */}
        <div className="space-y-3 pt-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/guide/onboarding')}
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/guide/interactive')}
          >
            Try Interactive Demo
          </Button>
        </div>

        {/* Testimonial or Stats */}
        <Card className="p-6 bg-muted/50 border-none">
          <p className="text-sm text-center text-muted-foreground italic">
            "This course helped me understand what it really takes to care for a dog. 
            I feel so much more confident and prepared!"
          </p>
          <p className="text-xs text-center text-muted-foreground mt-2">
            — Sarah, First-time dog owner
          </p>
        </Card>
      </div>
    </main>
  );
}
