import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, Calendar as CalendarIcon, Upload, Clock } from "lucide-react";
import { format } from "date-fns";
import { useDogNotes } from "@/hooks/useDogNotes";
import { cn } from "@/lib/utils";

interface QuickNoteModalProps {
  dogId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickNoteModal({ dogId, isOpen, onClose }: QuickNoteModalProps) {
  const [content, setContent] = useState("");
  const [noteDate, setNoteDate] = useState<Date>(new Date());
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<'photo' | 'video' | undefined>();
  
  const { addNote } = useDogNotes(dogId);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const success = await addNote(content, noteDate, mediaUrl || undefined, mediaType);
    
    if (success) {
      setContent("");
      setNoteDate(new Date());
      setMediaUrl("");
      setMediaType(undefined);
      onClose();
    }
  };

  const handleMediaUpload = () => {
    // Placeholder for media upload functionality
    // In a real app, this would integrate with Supabase storage
    alert("Media upload functionality - integrate with Supabase storage");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Quick Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="E.g., Noticed limping on left front paw..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !noteDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {noteDate ? format(noteDate, "PPP 'at' p") : <span>Pick a date & time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col">
                  <Calendar
                    mode="single"
                    selected={noteDate}
                    onSelect={(date) => {
                      if (date) {
                        // Preserve the time when changing date
                        const newDate = new Date(date);
                        newDate.setHours(noteDate.getHours());
                        newDate.setMinutes(noteDate.getMinutes());
                        setNoteDate(newDate);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  <div className="border-t p-3 space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={noteDate.getHours()}
                        onChange={(e) => {
                          const hours = parseInt(e.target.value) || 0;
                          const newDate = new Date(noteDate);
                          newDate.setHours(Math.min(23, Math.max(0, hours)));
                          setNoteDate(newDate);
                        }}
                        className="w-16 text-center"
                        placeholder="HH"
                      />
                      <span className="text-lg">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={noteDate.getMinutes().toString().padStart(2, '0')}
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value) || 0;
                          const newDate = new Date(noteDate);
                          newDate.setMinutes(Math.min(59, Math.max(0, minutes)));
                          setNoteDate(newDate);
                        }}
                        className="w-16 text-center"
                        placeholder="MM"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Media (Optional)</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleMediaUpload}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleMediaUpload}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!content.trim()}>
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
