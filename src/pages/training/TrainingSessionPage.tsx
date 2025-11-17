import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Radio, Play, Pause, RotateCcw, CheckCircle, Clock, Lightbulb, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTricks } from "@/hooks/useTricks";
import { useDogs } from "@/hooks/useDogs";
import { toast } from "@/hooks/use-toast";
import clickerSound from "@/assets/dog-clicker.mp3";

export default function TrainingSessionPage() {
  const { trickId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dogs } = useDogs();
  const selectedDog = dogs[0];
  const { dogSkills, recordPracticeSession } = useSkills(selectedDog?.id);
  
  const [trick, setTrick] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dogTrickId, setDogTrickId] = useState<string | null>(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default
  const [timerDuration, setTimerDuration] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Session completion form state
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [context, setContext] = useState<string>("home_indoor");
  const [distractionLevel, setDistractionLevel] = useState<string>("none");
  const [successRate, setSuccessRate] = useState<number[]>([70]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch trick data
  useEffect(() => {
    async function fetchTrick() {
      if (!trickId) return;
      
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", trickId)
        .single();
      
      if (error) {
        console.error("Error fetching trick:", error);
        toast({
          title: "Error",
          description: "Failed to load training session",
          variant: "destructive",
        });
        navigate(-1);
        return;
      }
      
      setTrick(data);
      
      // Find the dog_skill record
      const dogSkill = dogSkills.find(dt => dt.skill_id === trickId);
      if (dogSkill) {
        setDogTrickId(dogSkill.id);
      }
      
      setLoading(false);
    }
    
    fetchTrick();
  }, [trickId, dogSkills, navigate]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setTimerFinished(true);
            playTimerAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const playTimerAlert = () => {
    if (alertAudioRef.current) {
      alertAudioRef.current.play().catch(err => console.log("Alert play failed:", err));
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const playClickSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log("Click play failed:", err));
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const toggleTimer = () => {
    if (timerFinished) {
      // Reset timer
      setTimeRemaining(timerDuration);
      setTimerFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(timerDuration);
    setTimerFinished(false);
  };

  const adjustDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeRemaining(seconds);
    setIsRunning(false);
    setTimerFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSession = async () => {
    if (!dogTrickId || !selectedDog) {
      toast({
        title: "Error",
        description: "Unable to save session. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await recordPracticeSession(
        dogTrickId,
        context,
        distractionLevel as 'none' | 'mild' | 'moderate' | 'high',
        successRate[0],
        notes
      );
      
      toast({
        title: "Session Complete! 🎉",
        description: "Great work! Your progress has been saved.",
      });
      
      // Navigate back to skill detail page
      navigate(`/training/skill/${trickId}/detail`);
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!trick) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Training Session Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hidden audio elements */}
      <audio ref={audioRef} src={clickerSound} preload="auto" />
      <audio ref={alertAudioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltv0xnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSCAy/HZizcIF2ax6+mjUBAMUKjk77RfGgY8mN700XoyBShzy/DajzoIGGe67Oacrg" type="audio/wav" />
      </audio>
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold">Training Session</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Skill Name */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{trick.name}</h2>
          <p className="text-muted-foreground">Practice makes perfect!</p>
        </div>

        {/* Timer Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Training Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${timerFinished ? 'text-success' : isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
                {formatTime(timeRemaining)}
              </div>
              {timerFinished && (
                <p className="text-success font-semibold mt-2">Time's up! Great session! 🎉</p>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(3)}
                disabled={isRunning}
              >
                3 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(5)}
                disabled={isRunning}
              >
                5 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(10)}
                disabled={isRunning}
              >
                10 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(15)}
                disabled={isRunning}
              >
                15 min
              </Button>
            </div>

            {/* Start/Pause/Reset */}
            <div className="flex gap-2 justify-center">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="flex-1 max-w-xs"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {timerFinished ? 'Restart' : 'Start'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={resetTimer}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clicker Button */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Click at the exact moment your dog performs the behavior
              </p>
              <button
                onClick={playClickSound}
                className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/50 flex items-center justify-center"
              >
                <div className="text-center">
                  <Radio className="w-12 h-12 text-primary-foreground mx-auto mb-2" />
                  <span className="text-2xl font-bold text-primary-foreground">
                    CLICK
                  </span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                1
              </div>
              <p className="text-sm">Keep training sessions short and positive. End on a success!</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <p className="text-sm">Click immediately when your dog performs the behavior, then reward.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                3
              </div>
              <p className="text-sm">Practice in different locations to help your dog generalize the skill.</p>
            </div>
          </CardContent>
        </Card>

        {/* Common Problems & Solutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Common Problems & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Dog isn't responding to cue</h4>
              <p className="text-sm text-muted-foreground">
                Go back a step. Make it easier by luring with a treat and gradually fade the lure.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Inconsistent performance</h4>
              <p className="text-sm text-muted-foreground">
                Reduce distractions and practice in a quieter environment. Build up gradually.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Dog gets distracted easily</h4>
              <p className="text-sm text-muted-foreground">
                Use higher-value treats and keep sessions shorter. Practice focus exercises first.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Complete Session Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={() => setShowCompletionDialog(true)}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Session
        </Button>
      </div>

      {/* Session Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Practice Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="context">Practice Context</Label>
              <Select value={context} onValueChange={setContext}>
                <SelectTrigger id="context">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_indoor">Home (Indoor)</SelectItem>
                  <SelectItem value="home_outdoor">Home (Outdoor)</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="street">Street/Sidewalk</SelectItem>
                  <SelectItem value="pet_store">Pet Store</SelectItem>
                  <SelectItem value="friends_house">Friend's House</SelectItem>
                  <SelectItem value="other">Other Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Distraction Level */}
            <div className="space-y-2">
              <Label htmlFor="distraction">Distraction Level</Label>
              <Select value={distractionLevel} onValueChange={setDistractionLevel}>
                <SelectTrigger id="distraction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Quiet environment</SelectItem>
                  <SelectItem value="mild">Mild - Some background activity</SelectItem>
                  <SelectItem value="moderate">Moderate - Other people/pets nearby</SelectItem>
                  <SelectItem value="high">High - Busy, exciting environment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Success Rate */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="success-rate">Success Rate</Label>
                <span className="text-sm font-semibold text-primary">{successRate[0]}%</span>
              </div>
              <Slider
                id="success-rate"
                min={0}
                max={100}
                step={5}
                value={successRate}
                onValueChange={setSuccessRate}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Estimate how often your dog successfully performed the behavior
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any observations, challenges, or breakthroughs?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompletionDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSession}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
