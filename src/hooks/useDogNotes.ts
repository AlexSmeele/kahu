import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DogNote {
  id: string;
  dog_id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'photo' | 'video';
  note_date: string;
  created_at: string;
  updated_at: string;
}

export const useDogNotes = (dogId: string) => {
  const [notes, setNotes] = useState<DogNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    if (!dogId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('dog_notes')
      .select('*')
      .eq('dog_id', dogId)
      .order('note_date', { ascending: false });

    if (error) {
      toast({ title: "Error loading notes", variant: "destructive" });
      setLoading(false);
      return;
    }

    setNotes((data || []) as DogNote[]);
    setLoading(false);
  };

  const addNote = async (content: string, noteDate: Date, mediaUrl?: string, mediaType?: 'photo' | 'video') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('dog_notes')
      .insert([{
        dog_id: dogId,
        user_id: user.id,
        content,
        note_date: noteDate.toISOString(),
        media_url: mediaUrl,
        media_type: mediaType
      }]);

    if (error) {
      toast({ title: "Error adding note", variant: "destructive" });
      return false;
    }

    toast({ title: "Note added successfully!" });
    await fetchNotes();
    return true;
  };

  const updateNote = async (id: string, content: string, noteDate: Date) => {
    const { error } = await supabase
      .from('dog_notes')
      .update({ content, note_date: noteDate.toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: "Error updating note", variant: "destructive" });
      return false;
    }

    toast({ title: "Note updated successfully!" });
    await fetchNotes();
    return true;
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('dog_notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error deleting note", variant: "destructive" });
      return false;
    }

    toast({ title: "Note deleted successfully!" });
    await fetchNotes();
    return true;
  };

  useEffect(() => {
    fetchNotes();
  }, [dogId]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};
