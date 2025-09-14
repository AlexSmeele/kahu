import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
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

    const authToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { token }: AcceptInvitationRequest = await req.json();

    if (!token) {
      throw new Error('Missing invitation token');
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select(`
        *,
        families (
          id,
          name,
          created_by
        )
      `)
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (invitationError || !invitation) {
      throw new Error('Invalid or expired invitation token');
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      throw new Error('This invitation has expired');
    }

    // Get user's profile to check email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if invitation email matches user's email
    if (invitation.email !== user.email) {
      throw new Error('This invitation was sent to a different email address');
    }

    // Check if user is already a member of this family
    const { data: existingMembership } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', invitation.family_id)
      .eq('user_id', user.id)
      .single();

    if (existingMembership) {
      throw new Error('You are already a member of this family');
    }

    // Begin transaction-like operations
    try {
      // Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invitation.family_id,
          user_id: user.id,
          role: invitation.role,
          status: 'active'
        });

      if (memberError) {
        console.error('Error adding family member:', memberError);
        throw new Error('Failed to add you to the family');
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        // This is not critical, we can continue
      }

      console.log('Family invitation accepted successfully:', {
        userId: user.id,
        familyId: invitation.family_id,
        role: invitation.role
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully joined the family!',
          family: {
            id: invitation.families.id,
            name: invitation.families.name,
            role: invitation.role
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      throw new Error('Failed to complete invitation acceptance');
    }

  } catch (error: any) {
    console.error('Error in accept-family-invitation function:', error);
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