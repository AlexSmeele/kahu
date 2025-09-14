import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyManagement } from '@/hooks/useFamilyManagement';
import { useToast } from '@/hooks/use-toast';

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { acceptInvitation } = useFamilyManagement();
  const { toast } = useToast();
  
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to auth page with return URL
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, authLoading, navigate]);

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;

    setAccepting(true);
    setError(null);

    try {
      const result = await acceptInvitation(token);
      
      if (result.success) {
        setAccepted(true);
        
        // Redirect to home after a brief delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This invitation link is invalid or expired.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Family Invitation
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {accepted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Welcome to the family!</h3>
                <p className="text-muted-foreground">
                  You've successfully joined the family. Redirecting to the app...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h3 className="font-semibold">You've been invited!</h3>
                <p className="text-muted-foreground">
                  You've been invited to join a family on Kahu Dog Trainer.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium text-primary mb-2">With family sharing, you'll be able to:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• View and manage shared dog profiles</li>
                    <li>• Track health records and vaccinations together</li>
                    <li>• Share training progress and achievements</li>
                    <li>• Coordinate feeding and care schedules</li>
                  </ul>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={accepting}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className="flex-1"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;