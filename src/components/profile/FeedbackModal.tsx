import { useState } from "react";
import { MessageSquare, Star, Send, X, Bug, Lightbulb, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general' | ''>('');
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!feedbackType || !message.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "We need your feedback type and message to help you better.",
        variant: "destructive",
      });
      return;
    }

    // Here you would send the feedback to your backend
    toast({
      title: "Feedback sent!",
      description: "Thank you for helping us improve the app. We'll review your feedback soon.",
    });

    // Reset form
    setFeedbackType('');
    setRating(0);
    setMessage('');
    onClose();
  };

  const feedbackTypes = [
    {
      value: 'bug',
      label: 'Bug Report',
      description: 'Something is not working correctly',
      icon: Bug,
      color: 'text-destructive',
    },
    {
      value: 'feature',
      label: 'Feature Request',
      description: 'Suggest a new feature or improvement',
      icon: Lightbulb,
      color: 'text-warning',
    },
    {
      value: 'general',
      label: 'General Feedback',
      description: 'Share your thoughts about the app',
      icon: Heart,
      color: 'text-success',
    },
  ];

  const selectedType = feedbackTypes.find(type => type.value === feedbackType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send Feedback
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Help us improve by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feedback Type */}
          <div>
            <Label className="font-medium mb-2 block">What type of feedback is this?</Label>
            <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as typeof feedbackType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {selectedType && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedType.description}
              </p>
            )}
          </div>

          {/* Rating (for general feedback) */}
          {feedbackType === 'general' && (
            <div>
              <Label className="font-medium mb-2 block">How would you rate your experience?</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(star)}
                    className="p-1 h-8 w-8"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating} out of 5 stars
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="feedback-message" className="font-medium mb-2 block">
              {feedbackType === 'bug' && 'Describe the bug and how to reproduce it'}
              {feedbackType === 'feature' && 'Describe your feature idea'}
              {feedbackType === 'general' && 'Tell us more about your experience'}
              {!feedbackType && 'Your message'}
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'bug'
                  ? 'Please describe what happened, what you expected, and any steps to reproduce the issue...'
                  : feedbackType === 'feature'
                  ? 'Describe the feature you\'d like to see and how it would help you...'
                  : 'Share your thoughts, suggestions, or any other feedback...'
              }
              rows={5}
            />
          </div>

          {/* Additional context for bug reports */}
          {feedbackType === 'bug' && (
            <div className="p-3 bg-muted/20 rounded-lg text-sm">
              <div className="font-medium mb-1">Helpful details to include:</div>
              <ul className="text-muted-foreground space-y-1">
                <li>• What screen or feature you were using</li>
                <li>• What you clicked or tapped</li>
                <li>• Any error messages you saw</li>
                <li>• Your device type (phone/tablet/desktop)</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Send Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}