import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, Calendar as CalendarIcon, Upload } from "lucide-react";
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
            <Label>Date</Label>
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
                  {noteDate ? format(noteDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={noteDate}
                  onSelect={(date) => date && setNoteDate(date)}
                  initialFocus
                />
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
