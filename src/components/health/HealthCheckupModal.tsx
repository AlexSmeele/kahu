import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useHealthCheckups } from "@/hooks/useHealthCheckups";
import { Slider } from "@/components/ui/slider";

interface HealthCheckupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
}

export const HealthCheckupModal = ({
  isOpen,
  onClose,
  dogId,
}: HealthCheckupModalProps) => {
  const { addCheckup } = useHealthCheckups(dogId);
  const [checkupData, setCheckupData] = useState({
    body_condition_score: 5,
    lumps_found: false,
    lump_notes: "",
    ear_condition: "normal",
    ear_notes: "",
    eye_condition: "normal",
    eye_notes: "",
    skin_condition: "normal",
    skin_notes: "",
    behavior_changes: "",
    overall_notes: "",
  });

  const handleSubmit = async () => {
    await addCheckup({
      checkup_date: new Date().toISOString(),
      ...checkupData,
    });
    onClose();
    setCheckupData({
      body_condition_score: 5,
      lumps_found: false,
      lump_notes: "",
      ear_condition: "normal",
      ear_notes: "",
      eye_condition: "normal",
      eye_notes: "",
      skin_condition: "normal",
      skin_notes: "",
      behavior_changes: "",
      overall_notes: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weekly Health Checkup</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Body Condition Score */}
          <div className="space-y-3">
            <Label>Body Condition Score (1-9)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[checkupData.body_condition_score]}
                onValueChange={(value) =>
                  setCheckupData({
                    ...checkupData,
                    body_condition_score: value[0],
                  })
                }
                min={1}
                max={9}
                step={1}
                className="flex-1"
              />
              <span className="text-xl font-semibold w-8 text-center">
                {checkupData.body_condition_score}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              1: Very thin, 5: Ideal, 9: Obese
            </p>
          </div>

          {/* Lumps Check */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lumps"
                checked={checkupData.lumps_found}
                onCheckedChange={(checked) =>
                  setCheckupData({
                    ...checkupData,
                    lumps_found: checked as boolean,
                  })
                }
              />
              <Label htmlFor="lumps">Lumps or bumps found</Label>
            </div>
            {checkupData.lumps_found && (
              <Textarea
                placeholder="Describe location and characteristics..."
                value={checkupData.lump_notes}
                onChange={(e) =>
                  setCheckupData({
                    ...checkupData,
                    lump_notes: e.target.value,
                  })
                }
              />
            )}
          </div>

          {/* Ear Condition */}
          <div className="space-y-3">
            <Label>Ear Condition</Label>
            <RadioGroup
              value={checkupData.ear_condition}
              onValueChange={(value) =>
                setCheckupData({ ...checkupData, ear_condition: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="ear-normal" />
                <Label htmlFor="ear-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="red" id="ear-red" />
                <Label htmlFor="ear-red">Redness</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="discharge" id="ear-discharge" />
                <Label htmlFor="ear-discharge">Discharge</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="odor" id="ear-odor" />
                <Label htmlFor="ear-odor">Bad odor</Label>
              </div>
            </RadioGroup>
            {checkupData.ear_condition !== "normal" && (
              <Textarea
                placeholder="Additional notes..."
                value={checkupData.ear_notes}
                onChange={(e) =>
                  setCheckupData({ ...checkupData, ear_notes: e.target.value })
                }
              />
            )}
          </div>

          {/* Eye Condition */}
          <div className="space-y-3">
            <Label>Eye Condition</Label>
            <RadioGroup
              value={checkupData.eye_condition}
              onValueChange={(value) =>
                setCheckupData({ ...checkupData, eye_condition: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="eye-normal" />
                <Label htmlFor="eye-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="discharge" id="eye-discharge" />
                <Label htmlFor="eye-discharge">Discharge</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="redness" id="eye-redness" />
                <Label htmlFor="eye-redness">Redness</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cloudiness" id="eye-cloudiness" />
                <Label htmlFor="eye-cloudiness">Cloudiness</Label>
              </div>
            </RadioGroup>
            {checkupData.eye_condition !== "normal" && (
              <Textarea
                placeholder="Additional notes..."
                value={checkupData.eye_notes}
                onChange={(e) =>
                  setCheckupData({ ...checkupData, eye_notes: e.target.value })
                }
              />
            )}
          </div>

          {/* Skin Condition */}
          <div className="space-y-3">
            <Label>Skin Condition</Label>
            <RadioGroup
              value={checkupData.skin_condition}
              onValueChange={(value) =>
                setCheckupData({ ...checkupData, skin_condition: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="skin-normal" />
                <Label htmlFor="skin-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dry" id="skin-dry" />
                <Label htmlFor="skin-dry">Dry/Flaky</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="irritated" id="skin-irritated" />
                <Label htmlFor="skin-irritated">Irritated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rash" id="skin-rash" />
                <Label htmlFor="skin-rash">Rash</Label>
              </div>
            </RadioGroup>
            {checkupData.skin_condition !== "normal" && (
              <Textarea
                placeholder="Additional notes..."
                value={checkupData.skin_notes}
                onChange={(e) =>
                  setCheckupData({
                    ...checkupData,
                    skin_notes: e.target.value,
                  })
                }
              />
            )}
          </div>

          {/* Behavior Changes */}
          <div className="space-y-3">
            <Label>Behavior Changes</Label>
            <Textarea
              placeholder="Any changes in behavior, energy, appetite, etc..."
              value={checkupData.behavior_changes}
              onChange={(e) =>
                setCheckupData({
                  ...checkupData,
                  behavior_changes: e.target.value,
                })
              }
            />
          </div>

          {/* Overall Notes */}
          <div className="space-y-3">
            <Label>Overall Notes</Label>
            <Textarea
              placeholder="Any other observations..."
              value={checkupData.overall_notes}
              onChange={(e) =>
                setCheckupData({
                  ...checkupData,
                  overall_notes: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Save Checkup
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
