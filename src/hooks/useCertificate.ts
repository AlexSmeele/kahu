import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface Certificate {
  id: string;
  user_id: string;
  issued_at: string;
  score_pct: number;
  readiness_score: number | null;
  name_on_cert: string;
  badge_tier: string;
  share_url: string | null;
  pdf_url: string | null;
}

export function useCertificate() {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificate();
    }
  }, [user]);

  const fetchCertificate = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCertificate(data);
    } catch (error) {
      logger.error('Error fetching certificate', error);
    } finally {
      setLoading(false);
    }
  };

  const createCertificate = async (scorePct: number, nameOnCert: string) => {
    if (!user) return null;

    try {
      const badgeTier = scorePct >= 95 ? 'gold' : scorePct >= 85 ? 'silver' : 'bronze';
      
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          score_pct: scorePct,
          name_on_cert: nameOnCert,
          badge_tier: badgeTier,
        })
        .select()
        .single();

      if (error) throw error;

      setCertificate(data);
      return data;
    } catch (error) {
      logger.error('Error creating certificate', error);
      return null;
    }
  };

  return {
    certificate,
    loading,
    createCertificate,
    refetch: fetchCertificate,
  };
}
