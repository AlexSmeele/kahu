import { useState, useEffect } from "react";
import { Heart, Plus, Camera, Video, Calendar, AlertTriangle, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useHealthRecords } from "@/hooks/useHealthRecords";

interface HealthNote {
  id: string;
  date: Date;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'behavior' | 'physical' | 'medication' | 'diet' | 'other';
  attachments?: {
    type: 'image' | 'video';
    url: string;
    name: string;
  }[];
  resolved?: boolean;
}

interface HealthNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogName: string;
  dogId: string;
}

// Mock data
const mockHealthNotes: HealthNote[] = [
  {
    id: "1",
    date: new Date(2024, 7, 20),
    title: "Slight limp on left paw",
    description: "Noticed Jett favoring his right side during walks. No visible swelling or cuts. Monitoring for a few days.",
    severity: "medium",
    category: "physical",
    resolved: false,
  },
  {
    id: "2",
    date: new Date(2024, 7, 15),
    title: "Increased water consumption",
    description: "Drinking noticeably more water than usual over the past 3 days. Will mention to vet at next visit.",
    severity: "low",
    category: "behavior",
    resolved: false,
  },
  {
    id: "3",
    date: new Date(2024, 6, 28),
    title: "Allergic reaction to new treats",
    description: "Developed small red bumps after trying new chicken treats. Discontinued immediately. Reaction cleared up in 24 hours.",
    severity: "medium", 
    category: "diet",
    resolved: true,
    attachments: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop",
        name: "skin_reaction.jpg"
      }
    ]
  },
];

export function HealthNotesModal({ isOpen, onClose, dogName, dogId }: HealthNotesModalProps) {
  const { healthRecords, loading, createHealthRecord, updateHealthRecord, uploadAttachment } = useHealthRecords(dogId);
  const [notes, setNotes] = useState<HealthNote[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    severity: '' as HealthNote['severity'] | '',
    category: '' as HealthNote['category'] | '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const getSeverityColor = (severity: HealthNote['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryColor = (category: HealthNote['category']) => {
    switch (category) {
      case 'behavior':
        return 'bg-primary/10 text-primary';
      case 'physical':
        return 'bg-destructive/10 text-destructive';
      case 'medication':
        return 'bg-accent/10 text-accent';
      case 'diet':
        return 'bg-warning/10 text-warning';
      case 'other':
        return 'bg-muted/10 text-muted-foreground';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  // Safely parse notes JSON stored as string; tolerate plain text
  const safeParseNotes = (value?: string) => {
    try {
      if (!value || typeof value !== 'string') return {};
      const t = value.trim();
      if (!t.startsWith('{') && !t.startsWith('[')) return {};
      return JSON.parse(t);
    } catch {
      return {};
    }
  };

   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return (isImage || isVideo) && file.size < 10 * 1024 * 1024; // 10MB limit
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.description || !newNote.severity || !newNote.category) {
      return;
    }

    // Upload attachments if any
    const attachmentUrls = [];
    for (const file of selectedFiles) {
      const url = await uploadAttachment(dogId, file);
      if (url) {
        attachmentUrls.push({
          type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
          url,
          name: file.name,
        });
      }
    }

    // Create health record in database
    await createHealthRecord({
      dog_id: dogId,
      record_type: 'note',
      title: newNote.title,
      description: newNote.description,
      date: newNote.date,
      notes: JSON.stringify({
        severity: newNote.severity,
        category: newNote.category,
        attachments: attachmentUrls,
        resolved: false,
      }),
    });

    setNewNote({
      title: '',
      description: '',
      severity: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedFiles([]);
    setShowAddForm(false);
  };

  const toggleResolved = async (noteId: string) => {
    const record = healthRecords.find(r => r.id === noteId);
    if (!record) return;

    const currentNotes = safeParseNotes(record.notes) as any;
    const newResolved = !currentNotes.resolved;

    await updateHealthRecord(noteId, {
      notes: JSON.stringify({
        ...currentNotes,
        resolved: newResolved,
      }),
    });
  };

  // Convert health records to notes format
  useEffect(() => {
    const convertedNotes: HealthNote[] = healthRecords
      .filter(record => record.record_type === 'note')
      .map(record => {
        const noteData = safeParseNotes(record.notes);
        return {
          id: record.id,
          date: new Date(record.date),
          title: record.title,
          description: record.description || '',
          severity: noteData.severity || 'low',
          category: noteData.category || 'other',
          attachments: noteData.attachments || [],
          resolved: noteData.resolved || false,
        };
      });
    
    setNotes(convertedNotes);
  }, [healthRecords]);

  const unresolvedNotes = notes.filter(n => !n.resolved);
  const resolvedNotes = notes.filter(n => n.resolved);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,500px)] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {dogName}'s Health Notes
          </DialogTitle>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-warning/10 rounded-lg text-center">
              <div className="text-lg font-bold text-warning">{unresolvedNotes.length}</div>
              <div className="text-xs text-muted-foreground">Active Issues</div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <div className="text-lg font-bold text-success">{resolvedNotes.length}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-lg font-bold text-primary">{notes.length}</div>
              <div className="text-xs text-muted-foreground">Total Notes</div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-4">
            {/* Add Note Form */}
            {showAddForm && (
              <div className="card-soft p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add Health Note</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="note-date">Date</Label>
                    <Input
                      id="note-date"
                      type="date"
                      value={newNote.date}
                      onChange={(e) => setNewNote(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-severity">Severity</Label>
                    <Select value={newNote.severity} onValueChange={(value) => setNewNote(prev => ({ ...prev, severity: value as HealthNote['severity'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Severity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Monitor</SelectItem>
                        <SelectItem value="medium">Medium - Concerning</SelectItem>
                        <SelectItem value="high">High - Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="note-title">Title</Label>
                    <Input
                      id="note-title"
                      value={newNote.title}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-category">Category</Label>
                    <Select value={newNote.category} onValueChange={(value) => setNewNote(prev => ({ ...prev, category: value as HealthNote['category'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="behavior">Behavior</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="diet">Diet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="note-description">Description</Label>
                  <Textarea
                    id="note-description"
                    value={newNote.description}
                    onChange={(e) => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of what you observed..."
                    rows={3}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label>Photos/Videos (Optional)</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="text-xs"
                      >
                        <Camera className="w-3 h-3 mr-1" />
                        Add Photo/Video
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <span className="text-xs text-muted-foreground">
                        Max 3 files, 10MB each
                      </span>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-xs">
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') ? (
                                <Camera className="w-3 h-3" />
                              ) : (
                                <Video className="w-3 h-3" />
                              )}
                              <span className="truncate">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleAddNote} size="sm" className="w-full">
                  Add Health Note
                </Button>
              </div>
            )}

            {/* Active Notes */}
            {unresolvedNotes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Active Issues ({unresolvedNotes.length})
                </h4>
                <div className="space-y-3">
                  {unresolvedNotes.map((note) => (
                    <div key={note.id} className="card-soft p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(note.date, 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <h5 className="font-medium">{note.title}</h5>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={`${getSeverityColor(note.severity)} text-xs border`}>
                            {note.severity}
                          </Badge>
                          <Badge className={`${getCategoryColor(note.category)} text-xs`}>
                            {note.category}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{note.description}</p>

                      {note.attachments && note.attachments.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {note.attachments.map((attachment, index) => (
                            <div key={index} className="relative">
                              {attachment.type === 'image' ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                  <Video className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleResolved(note.id)}
                          className="text-xs"
                        >
                          Mark Resolved
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Notes */}
            {resolvedNotes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-muted-foreground">
                  Resolved Issues ({resolvedNotes.length})
                </h4>
                <div className="space-y-3">
                  {resolvedNotes.map((note) => (
                    <div key={note.id} className="card-soft p-3 opacity-75">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm line-through">{note.title}</h5>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="bg-success/10 text-success text-xs">
                            Resolved
                          </Badge>
                          <Badge className={`${getCategoryColor(note.category)} text-xs`}>
                            {note.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{note.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(note.date, 'MMM dd, yyyy')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleResolved(note.id)}
                          className="text-xs ml-auto"
                        >
                          Reopen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notes.length === 0 && (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No health notes recorded yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Health Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}