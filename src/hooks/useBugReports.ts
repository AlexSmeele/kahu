import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBugReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const reportBug = async (
    attemptedRoute: string,
    userIntent: string,
    description: string,
    additionalDetails: string | null = null
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Format the message content
      const messageContent = `404 Bug Report
Route: ${attemptedRoute}
User Intent: ${userIntent}
Description: ${description}`;

      const { data, error } = await supabase
        .from('message_reports')
        .insert({
          user_id: user.id,
          message_content: messageContent,
          report_reason: 'bug_report_404',
          report_details: additionalDetails,
          conversation_context: {
            attemptedRoute,
            userIntent,
            description,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bug Report Submitted",
        description: "Thank you for helping us improve Kahu!",
      });
      return data;
    } catch (error) {
      console.error('Error reporting bug:', error);
      toast({
        title: "Error",
        description: "Failed to submit bug report",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    reportBug,
  };
};
