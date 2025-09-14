import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageReport {
  id: string;
  user_id: string;
  dog_id: string | null;
  message_content: string;
  conversation_context: any;
  report_reason: string;
  report_details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useMessageReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const reportMessage = async (
    messageContent: string,
    reportReason: string,
    reportDetails: string | null = null,
    dogId: string | null = null,
    conversationContext: any = null
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('message_reports')
        .insert({
          user_id: user.id,
          message_content: messageContent,
          report_reason: reportReason,
          report_details: reportDetails,
          dog_id: dogId,
          conversation_context: conversationContext,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We'll review this message.",
      });
      return data;
    } catch (error) {
      console.error('Error reporting message:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    reportMessage,
    fetchUserReports,
  };
};