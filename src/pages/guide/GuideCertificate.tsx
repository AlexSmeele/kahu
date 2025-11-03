import { ArrowLeft, Award, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCertificate } from "@/hooks/useCertificate";

export default function GuideCertificate() {
  const navigate = useNavigate();
  const { certificate, loading } = useCertificate();

  if (loading) {
    return (
      <main className="content-frame bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading certificate...</div>
        </div>
      </main>
    );
  }

  if (!certificate) {
    return (
      <main className="content-frame bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg">Your Certificate</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="p-6 max-w-2xl mx-auto pb-24">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-2xl mb-4">No Certificate Yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete the final test with a score of 80% or higher to earn your certificate.
            </p>
            <Button onClick={() => navigate('/guide/final-test')}>
              Take Final Test
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-orange-600';
      default: return 'text-primary';
    }
  };

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Your Certificate</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto pb-24">
        {/* Certificate Display */}
        <Card className="p-8 text-center mb-6 border-2 border-primary/20">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Award className={`w-12 h-12 ${getBadgeColor(certificate.badge_tier)}`} />
          </div>

          <h2 className="font-bold text-2xl mb-2">Certificate of Completion</h2>
          <p className="text-muted-foreground mb-6">Pre-Purchase Dog Ownership Education</p>

          <div className="py-6 border-y border-border mb-6">
            <p className="text-sm text-muted-foreground mb-2">This certifies that</p>
            <p className="font-bold text-xl mb-4">{certificate.name_on_cert}</p>
            <p className="text-sm text-muted-foreground">
              has successfully completed the comprehensive pre-purchase dog ownership course
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Score</p>
              <p className="font-bold text-lg">{certificate.score_pct}%</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Badge</p>
              <p className="font-bold text-lg capitalize">{certificate.badge_tier}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Issued on {new Date(certificate.issued_at).toLocaleDateString()}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full" disabled>
            <Download className="w-4 h-4 mr-2" />
            Download Certificate (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full" disabled>
            <Share2 className="w-4 h-4 mr-2" />
            Share Certificate (Coming Soon)
          </Button>
          <Button className="w-full" onClick={() => navigate('/guide/resources')}>
            See Personalized Recommendations
          </Button>
        </div>
      </div>
    </main>
  );
}
