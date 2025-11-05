import { useState } from "react";
import { Phone, Camera, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useVetClinics } from "@/hooks/useVetClinics";
import { supabase } from "@/integrations/supabase/client";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId?: string;
  dogName?: string;
}

export function EmergencyModal({ isOpen, onClose, dogId, dogName }: EmergencyModalProps) {
  const { toast } = useToast();
  const { primaryClinic } = useVetClinics(dogId || '');
  const [details, setDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCallVet = () => {
    if (primaryClinic?.vet_clinic?.phone) {
      window.location.href = `tel:${primaryClinic.vet_clinic.phone}`;
    } else {
      toast({
        title: "No vet phone number",
        description: "Please add a primary vet clinic with a phone number first.",
        variant: "destructive"
      });
    }
  };

  const handleSaveIncident = async () => {
    if (!dogId || !details.trim()) {
      toast({
        title: "Missing information",
        description: "Please add incident details before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('dog_notes')
        .insert({
          dog_id: dogId,
          user_id: user.id,
          content: `🚨 EMERGENCY: ${details}`,
          note_date: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Emergency logged",
        description: "Incident details have been saved to your dog's health records.",
      });
      
      setDetails('');
      onClose();
    } catch (error) {
      console.error('Error saving emergency incident:', error);
      toast({
        title: "Error",
        description: "Failed to save incident details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadMedia = () => {
    toast({
      title: "Coming soon",
      description: "Photo/video upload for emergencies will be available soon.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <DialogTitle>Emergency Assistance</DialogTitle>
          </div>
          <DialogDescription>
            Get immediate help for {dogName || "your pet"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Call Vet Button */}
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Your Vet
            </h3>
            {primaryClinic?.vet_clinic ? (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  {primaryClinic.vet_clinic.name}
                  {primaryClinic.vet_clinic.phone && (
                    <span className="block text-foreground font-medium">
                      {primaryClinic.vet_clinic.phone}
                    </span>
                  )}
                </p>
                <Button 
                  onClick={handleCallVet}
                  variant="destructive"
                  className="w-full"
                  disabled={!primaryClinic.vet_clinic.phone}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No primary vet clinic set. Add one in your pet's wellness settings.
              </p>
            )}
          </div>

          {/* Log Details Section */}
          <div className="space-y-2">
            <Label htmlFor="emergency-details">
              <FileText className="w-4 h-4 inline mr-1" />
              Incident Details
            </Label>
            <Textarea
              id="emergency-details"
              placeholder="Describe what happened (e.g., ate chocolate, injured paw, vomiting)..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Upload Media Button */}
          <Button
            variant="outline"
            onClick={handleUploadMedia}
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Upload Photo/Video
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveIncident}
              disabled={isSaving || !details.trim()}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Incident"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
