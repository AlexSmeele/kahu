import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  role: string;
  familyId: string;
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

    const { email, role, familyId }: InvitationRequest = await req.json();

    // Validate input
    if (!email || !role || !familyId) {
      throw new Error('Missing required fields: email, role, familyId');
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      throw new Error('Invalid role. Must be admin, member, or viewer');
    }

    // Check if user is admin of the family
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || membership.role !== 'admin') {
      throw new Error('Only family admins can send invitations');
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', email)
      .is('accepted_at', null)
      .single();

    if (existingInvitation) {
      throw new Error('An invitation has already been sent to this email address');
    }

    // Generate secure token
    const { data: tokenData } = await supabase.rpc('generate_invitation_token');
    const token_value = tokenData;

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        email,
        role,
        token: token_value,
        invited_by: user.id
      })
      .select('*, families(name)')
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw new Error('Failed to create invitation');
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    // Send email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const inviterName = inviterProfile?.display_name || 'A family member';
    const familyName = invitation.families?.name || 'the family';
    const acceptUrl = `${supabaseUrl.replace('supabase.co', 'lovableproject.com')}/accept-invitation?token=${token_value}`;

    const emailResponse = await resend.emails.send({
      from: 'Kahu Dog Trainer <noreply@resend.dev>',
      to: [email],
      subject: `You've been invited to join ${familyName} on Kahu`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">You're Invited!</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${inviterName} has invited you to join <strong>${familyName}</strong> on Kahu Dog Trainer.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            With family sharing, you'll be able to:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>View and manage shared dog profiles</li>
            <li>Track health records and vaccinations together</li>
            <li>Share training progress and achievements</li>
            <li>Coordinate feeding and care schedules</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This invitation will expire in 7 days.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log('Family invitation sent successfully:', {
      email,
      familyId,
      token: token_value.substring(0, 8) + '...',
      emailResponse
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          email,
          role,
          expires_at: invitation.expires_at
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-family-invitation function:', error);
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