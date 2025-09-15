import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FamilyMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  status: string;
  joined_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface FamilyInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  expires_at: string;
  created_at: string;
}

export const useFamilyManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('viewer');

  // Fetch user's families
  const fetchFamilies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          families (
            id,
            name,
            created_by,
            created_at
          ),
          role
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const familiesData = data?.map(item => item.families).filter(Boolean) || [];
      setFamilies(familiesData);

      // Set the first family as current family
      if (familiesData.length > 0 && !currentFamily) {
        setCurrentFamily(familiesData[0]);
        const userMembership = data?.find(item => item.families?.id === familiesData[0].id);
        setUserRole(userMembership?.role || 'viewer');
      }
    } catch (error: any) {
      console.error('Error fetching families:', error);
      toast({
        title: 'Error',
        description: 'Failed to load families',
        variant: 'destructive',
      });
    }
  };

  // Fetch family members
  const fetchFamilyMembers = async (familyId: string) => {
    try {
      // First get family members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, user_id, role, status, joined_at')
        .eq('family_id', familyId)
        .eq('status', 'active')
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Then get profiles for those members
      const userIds = membersData?.map(member => member.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      // Combine the data
      const combinedData = membersData?.map(member => ({
        ...member,
        role: member.role as 'admin' | 'member' | 'viewer',
        profiles: profilesData?.find(profile => profile.id === member.user_id)
      })) || [];

      setFamilyMembers(combinedData);
    } catch (error: any) {
      console.error('Error fetching family members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family members',
        variant: 'destructive',
      });
    }
  };

  // Fetch pending invitations
  const fetchPendingInvitations = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_invitations')
        .select('id, email, role, expires_at, created_at')
        .eq('family_id', familyId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = data?.map(invitation => ({
        ...invitation,
        role: invitation.role as 'admin' | 'member' | 'viewer'
      })) || [];

      setPendingInvitations(typedData);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
    }
  };

  // Send invitation
  const sendInvitation = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!currentFamily || !user) {
      throw new Error('No current family selected');
    }

    try {
      const { error } = await supabase.functions.invoke('send-family-invitation', {
        body: {
          email,
          role,
          familyId: currentFamily.id
        }
      });

      if (error) throw error;

      // Refresh invitations
      await fetchPendingInvitations(currentFamily.id);

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${email}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Get user's own invitations (with masked emails for security)
  const getUserInvitations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_invitations');
      
      if (error) throw error;
      
      return data?.map(invitation => ({
        ...invitation,
        role: invitation.role as 'admin' | 'member' | 'viewer'
      })) || [];
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      throw error;
    }
  };

  // Accept invitation (for invitation acceptance page)
  const acceptInvitation = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-family-invitation', {
        body: { token }
      });

      if (error) throw error;

      // Refresh families after successful acceptance
      await fetchFamilies();

      toast({
        title: 'Welcome to the family!',
        description: `You've successfully joined ${data.family?.name}`,
      });

      return { success: true, family: data.family };
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update member role
  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (!currentFamily) {
      throw new Error('No current family selected');
    }

    try {
      const { error } = await supabase.functions.invoke('manage-family-members', {
        body: {
          action: 'update_role',
          familyId: currentFamily.id,
          memberId,
          newRole
        }
      });

      if (error) throw error;

      // Refresh family members
      await fetchFamilyMembers(currentFamily.id);

      toast({
        title: 'Role updated',
        description: 'Member role updated successfully',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member role',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Remove member
  const removeMember = async (memberId: string) => {
    if (!currentFamily) {
      throw new Error('No current family selected');
    }

    try {
      const { error } = await supabase.functions.invoke('manage-family-members', {
        body: {
          action: 'remove_member',
          familyId: currentFamily.id,
          memberId
        }
      });

      if (error) throw error;

      // Refresh family members
      await fetchFamilyMembers(currentFamily.id);

      toast({
        title: 'Member removed',
        description: 'Family member removed successfully',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Generate share link
  const generateShareLink = () => {
    if (!currentFamily) return '';
    
    // This would use a proper invitation token in a real implementation
    // For now, we'll create a generic family invite link
    return `${window.location.origin}/join-family/${currentFamily.id}`;
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentFamily) return;

    const membersSubscription = supabase
      .channel(`family_members_${currentFamily.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members',
          filter: `family_id=eq.${currentFamily.id}`
        },
        () => {
          fetchFamilyMembers(currentFamily.id);
        }
      )
      .subscribe();

    const invitationsSubscription = supabase
      .channel(`family_invitations_${currentFamily.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_invitations',
          filter: `family_id=eq.${currentFamily.id}`
        },
        () => {
          fetchPendingInvitations(currentFamily.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membersSubscription);
      supabase.removeChannel(invitationsSubscription);
    };
  }, [currentFamily]);

  // Initial data loading
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchFamilies().finally(() => setLoading(false));
    }
  }, [user]);

  // Load family members when current family changes
  useEffect(() => {
    if (currentFamily) {
      fetchFamilyMembers(currentFamily.id);
      fetchPendingInvitations(currentFamily.id);
    }
  }, [currentFamily]);

  return {
    families,
    currentFamily,
    setCurrentFamily,
    familyMembers,
    pendingInvitations,
    loading,
    userRole,
    sendInvitation,
    getUserInvitations,
    acceptInvitation,
    updateMemberRole,
    removeMember,
    generateShareLink,
    refetch: fetchFamilies
  };
};