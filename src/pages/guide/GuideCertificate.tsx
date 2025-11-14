import { ArrowLeft, Award, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCertificate } from "@/hooks/useCertificate";
import { toast } from "sonner";
import { useRef } from "react";

export default function GuideCertificate() {
  const navigate = useNavigate();
  const { certificate, loading } = useCertificate();
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = () => {
    if (!certificate || !certificateRef.current) return;

    // Create HTML content for download
    const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${certificate.name_on_cert}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: white;
      color: #333;
    }
    .certificate {
      border: 8px double #4CAF50;
      padding: 60px;
      text-align: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .badge {
      font-size: 80px;
      margin: 20px 0;
    }
    h1 {
      font-size: 36px;
      margin: 20px 0;
      color: #2c3e50;
    }
    .subtitle {
      font-size: 18px;
      color: #7f8c8d;
      margin: 10px 0;
    }
    .name {
      font-size: 32px;
      font-weight: bold;
      margin: 30px 0;
      color: #2c3e50;
      font-style: italic;
    }
    .details {
      margin: 30px 0;
      font-size: 16px;
      color: #555;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 30px 0;
    }
    .stat {
      background: rgba(255,255,255,0.8);
      padding: 15px 30px;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 12px;
      color: #7f8c8d;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
    }
    .date {
      margin-top: 30px;
      font-size: 14px;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="badge">${certificate.badge_tier === 'gold' ? '🥇' : certificate.badge_tier === 'silver' ? '🥈' : '🥉'}</div>
    <h1>Certificate of Completion</h1>
    <p class="subtitle">Pre-Purchase Dog Ownership Education</p>
    
    <div class="details">
      <p>This certifies that</p>
      <p class="name">${certificate.name_on_cert}</p>
      <p>has successfully completed the comprehensive<br>pre-purchase dog ownership course</p>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Score</div>
        <div class="stat-value">${certificate.score_pct}%</div>
      </div>
      <div class="stat">
        <div class="stat-label">Badge</div>
        <div class="stat-value">${certificate.badge_tier.toUpperCase()}</div>
      </div>
    </div>
    
    <p class="date">Issued on ${new Date(certificate.issued_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>
</body>
</html>
    `.trim();

    // Create and download the file
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dog_Ownership_Certificate_${certificate.name_on_cert.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Certificate downloaded! Open the HTML file in your browser to view or print.");
  };

  const shareCertificate = async () => {
    if (!certificate) return;

    const shareData = {
      title: 'Dog Ownership Certificate',
      text: `I've completed the Pre-Purchase Dog Ownership Education course with a score of ${certificate.score_pct}% and earned a ${certificate.badge_tier} badge! 🐕`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `I've completed the Pre-Purchase Dog Ownership Education course with a score of ${certificate?.score_pct}% and earned a ${certificate?.badge_tier} badge! 🐕`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Achievement copied to clipboard!");
    });
  };

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
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
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
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
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
        <Card ref={certificateRef} className="p-8 text-center mb-6 border-2 border-primary/20">
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
          <Button variant="outline" className="w-full" onClick={downloadCertificate}>
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
          <Button variant="outline" className="w-full" onClick={shareCertificate}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Achievement
          </Button>
          <Button className="w-full" onClick={() => navigate('/guide/resources')}>
            View Resources & Recommendations
          </Button>
        </div>
      </div>
    </main>
  );
}
