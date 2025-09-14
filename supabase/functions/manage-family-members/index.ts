import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageMemberRequest {
  action: 'update_role' | 'remove_member';
  familyId: string;
  memberId: string;
  newRole?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { action, familyId, memberId, newRole }: ManageMemberRequest = await req.json();

    // Validate input
    if (!action || !familyId || !memberId) {
      throw new Error('Missing required fields: action, familyId, memberId');
    }

    if (!['update_role', 'remove_member'].includes(action)) {
      throw new Error('Invalid action. Must be update_role or remove_member');
    }

    // Check if user is admin of the family
    const { data: userMembership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!userMembership || userMembership.role !== 'admin') {
      throw new Error('Only family admins can manage members');
    }

    // Get the target member details
    const { data: targetMember } = await supabase
      .from('family_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('family_id', familyId)
      .eq('status', 'active')
      .single();

    if (!targetMember) {
      throw new Error('Family member not found');
    }

    // Prevent users from removing themselves or changing their own role
    if (targetMember.user_id === user.id) {
      throw new Error('You cannot manage your own membership');
    }

    // Prevent removing the family creator (they should always be admin)
    const { data: family } = await supabase
      .from('families')
      .select('created_by')
      .eq('id', familyId)
      .single();

    if (family && targetMember.user_id === family.created_by && action === 'remove_member') {
      throw new Error('Cannot remove the family creator');
    }

    if (action === 'update_role') {
      if (!newRole || !['admin', 'member', 'viewer'].includes(newRole)) {
        throw new Error('Invalid role. Must be admin, member, or viewer');
      }

      // Prevent demoting the family creator from admin
      if (family && targetMember.user_id === family.created_by && newRole !== 'admin') {
        throw new Error('Cannot change the role of the family creator');
      }

      const { error: updateError } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (updateError) {
        console.error('Error updating member role:', updateError);
        throw new Error('Failed to update member role');
      }

      console.log('Member role updated successfully:', {
        memberId,
        familyId,
        newRole,
        updatedBy: user.id
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Member role updated successfully',
          member: {
            id: memberId,
            role: newRole
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } else if (action === 'remove_member') {
      const { error: removeError } = await supabase
        .from('family_members')
        .update({ status: 'removed' })
        .eq('id', memberId);

      if (removeError) {
        console.error('Error removing member:', removeError);
        throw new Error('Failed to remove member');
      }

      console.log('Member removed successfully:', {
        memberId,
        familyId,
        removedBy: user.id
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Member removed successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error('Error in manage-family-members function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        success: false
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);