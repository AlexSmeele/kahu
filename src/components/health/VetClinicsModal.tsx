import React, { useState } from 'react';
import { MapPin, Phone, Globe, Plus, Edit2, Trash2, Star, StarOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VetClinicAutocomplete } from "@/components/ui/vet-clinic-autocomplete";
import { useVetClinics } from "@/hooks/useVetClinics";
import { useToast } from "@/hooks/use-toast";

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
}

interface VetClinicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  dogName: string;
}

export function VetClinicsModal({ isOpen, onClose, dogId, dogName }: VetClinicsModalProps) {
  const { dogVetClinics, primaryClinic, isLoading, error, addVetClinic, updateClinicRelationship, removeVetClinic } = useVetClinics(dogId);
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<VetClinic | null>(null);
  const [relationshipNotes, setRelationshipNotes] = useState('');

  const handleAddClinic = async () => {
    if (!selectedClinic) return;

    try {
      await addVetClinic(
        dogId,
        selectedClinic,
        dogVetClinics.length === 0, // Set as primary if it's the first clinic
        relationshipNotes || undefined
      );
      
      toast({
        title: "Vet clinic added",
        description: `${selectedClinic.name} has been added to ${dogName}'s health records.`,
      });
      
      setShowAddForm(false);
      setSelectedClinic(null);
      setRelationshipNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vet clinic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (relationshipId: string) => {
    try {
      await updateClinicRelationship(relationshipId, { is_primary: true });
      toast({
        title: "Primary vet updated",
        description: "Primary veterinary clinic has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary vet clinic.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveClinic = async (relationshipId: string, clinicName: string) => {
    try {
      await removeVetClinic(relationshipId);
      toast({
        title: "Vet clinic removed",
        description: `${clinicName} has been removed from ${dogName}'s records.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove vet clinic.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Veterinary Clinics</DialogTitle>
          <DialogDescription>
            Manage {dogName}'s veterinary clinic information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Vet Clinics */}
          {dogVetClinics.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Current Clinics</h4>
              {dogVetClinics.map((relationship) => (
                <Card key={relationship.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm">{relationship.vet_clinic.name}</h5>
                        {relationship.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                        {relationship.vet_clinic.verified && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-start gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{relationship.vet_clinic.address}</span>
                      </div>
                      {relationship.vet_clinic.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Phone className="h-3 w-3" />
                          <span>{relationship.vet_clinic.phone}</span>
                        </div>
                      )}
                      {relationship.vet_clinic.website && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>Website</span>
                        </div>
                      )}
                      {relationship.relationship_notes && (
                        <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                          {relationship.relationship_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {!relationship.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(relationship.id)}
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveClinic(relationship.id, relationship.vet_clinic.name)}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                No veterinary clinics added yet
              </p>
            </div>
          )}

          {/* Add New Clinic */}
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Veterinary Clinic
            </Button>
          ) : (
            <Card className="p-4">
              <h4 className="font-medium text-sm mb-4">Add New Clinic</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clinic-search">Search or Add Clinic</Label>
                  <VetClinicAutocomplete
                    value={selectedClinic}
                    onChange={setSelectedClinic}
                    placeholder="Search for veterinary clinic..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship-notes">Notes (Optional)</Label>
                  <Textarea
                    id="relationship-notes"
                    value={relationshipNotes}
                    onChange={(e) => setRelationshipNotes(e.target.value)}
                    placeholder="Add any notes about this clinic or your relationship with them..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddClinic}
                    disabled={!selectedClinic || isLoading}
                    size="sm"
                  >
                    Add Clinic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedClinic(null);
                      setRelationshipNotes('');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}