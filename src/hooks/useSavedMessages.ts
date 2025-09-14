import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedMessage {
  id: string;
  user_id: string;
  dog_id: string | null;
  message_content: string;
  conversation_context: any;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavedMessages = () => {
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedMessages(data || []);
    } catch (error) {
      console.error('Error fetching saved messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (
    messageContent: string,
    dogId: string | null = null,
    conversationContext: any = null,
    tags: string[] = [],
    notes: string | null = null
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_messages')
        .insert({
          user_id: user.id,
          message_content: messageContent,
          dog_id: dogId,
          conversation_context: conversationContext,
          tags,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedMessages(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Message saved successfully",
      });
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedMessage = async (messageId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('saved_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setSavedMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting saved message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSavedMessage = async (
    messageId: string,
    updates: Partial<Pick<SavedMessage, 'tags' | 'notes'>>
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_messages')
        .update(updates)
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      setSavedMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, ...data } : msg
      ));
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating saved message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedMessages();
  }, []);

  return {
    savedMessages,
    isLoading,
    saveMessage,
    deleteSavedMessage,
    updateSavedMessage,
    refetch: fetchSavedMessages,
  };
};