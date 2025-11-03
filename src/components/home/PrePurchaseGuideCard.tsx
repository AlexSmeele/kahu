import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function PrePurchaseGuideCard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{
    hasProfile: boolean;
    completedModules: number;
    hasCertificate: boolean;
  }>({
    hasProfile: false,
    completedModules: 0,
    hasCertificate: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check lifestyle profile
      const { data: profiles } = await supabase
        .from('lifestyle_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // Check module progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('mastered')
        .eq('user_id', user.id);

      // Check certificate
      const { data: certificates } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setProgress({
        hasProfile: (profiles?.length || 0) > 0,
        completedModules: userProgress?.filter(p => p.mastered).length || 0,
        hasCertificate: (certificates?.length || 0) > 0,
      });
    } catch (error) {
      console.error('Error fetching guide progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCallToAction = () => {
    if (progress.hasCertificate) {
      return {
        text: "View Certificate",
        action: () => navigate('/guide/certificate'),
        variant: "default" as const,
      };
    }
    if (progress.completedModules > 0) {
      return {
        text: "Continue Learning",
        action: () => navigate('/guide/modules'),
        variant: "default" as const,
      };
    }
    if (progress.hasProfile) {
      return {
        text: "Start Learning",
        action: () => navigate('/guide/modules'),
        variant: "default" as const,
      };
    }
    return {
      text: "Get Started",
      action: () => navigate('/guide/intro'),
      variant: "default" as const,
    };
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-1/3" />
        </div>
      </Card>
    );
  }

  const cta = getCallToAction();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Pre-Purchase Education Guide</h3>
            <p className="text-sm text-muted-foreground">
              Prepare for dog ownership
            </p>
          </div>
        </div>
        {progress.hasCertificate && (
          <Badge variant="default" className="gap-1">
            <Award className="w-3 h-3" />
            Certified
          </Badge>
        )}
      </div>

      {!progress.hasCertificate && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 
              className={`w-4 h-4 ${progress.hasProfile ? 'text-green-500' : 'text-muted-foreground'}`} 
            />
            <span className={progress.hasProfile ? 'text-foreground' : 'text-muted-foreground'}>
              Lifestyle Profile Complete
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 
              className={`w-4 h-4 ${progress.completedModules > 0 ? 'text-green-500' : 'text-muted-foreground'}`} 
            />
            <span className={progress.completedModules > 0 ? 'text-foreground' : 'text-muted-foreground'}>
              {progress.completedModules}/6 Modules Completed
            </span>
          </div>
        </div>
      )}

      <Button 
        onClick={cta.action}
        variant={cta.variant}
        className="w-full group"
      >
        {cta.text}
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Card>
  );
}
