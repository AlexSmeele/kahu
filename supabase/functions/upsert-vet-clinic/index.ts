import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VetClinicData {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  osm_place_id?: string;
  osm_type?: string;
  hours?: Record<string, any>;
  services?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clinicData, dogId, isPrimary = false, relationshipNotes } = await req.json();
    
    console.log('Upserting vet clinic:', { clinicData, dogId, isPrimary });
    
    if (!clinicData?.name || !clinicData?.address) {
      return new Response(
        JSON.stringify({ error: 'Clinic name and address are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!dogId) {
      return new Response(
        JSON.stringify({ error: 'Dog ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns the dog
    const { data: dog, error: dogError } = await supabase
      .from('dogs')
      .select('id, user_id')
      .eq('id', dogId)
      .single();

    if (dogError || !dog) {
      console.error('Dog verification error:', dogError);
      return new Response(
        JSON.stringify({ error: 'Dog not found or access denied' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if clinic already exists
    let clinic;
    if (clinicData.osm_place_id) {
      const { data: existingClinic } = await supabase
        .from('vet_clinics')
        .select('*')
        .eq('osm_place_id', clinicData.osm_place_id)
        .single();
      
      clinic = existingClinic;
    }

    // Create or update clinic
    if (!clinic) {
      console.log('Creating new vet clinic');
      const { data: newClinic, error: clinicError } = await supabase
        .from('vet_clinics')
        .insert({
          name: clinicData.name,
          address: clinicData.address,
          phone: clinicData.phone,
          email: clinicData.email,
          website: clinicData.website,
          latitude: clinicData.latitude,
          longitude: clinicData.longitude,
          osm_place_id: clinicData.osm_place_id,
          osm_type: clinicData.osm_type,
          hours: clinicData.hours,
          services: clinicData.services || [],
          verified: !!clinicData.osm_place_id // OSM places are considered verified
        })
        .select()
        .single();

      if (clinicError) {
        console.error('Clinic creation error:', clinicError);
        return new Response(
          JSON.stringify({ error: 'Failed to create clinic' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      clinic = newClinic;
    } else {
      console.log('Using existing clinic:', clinic.id);
    }

    // If setting as primary, update other clinics for this dog to not be primary
    if (isPrimary) {
      await supabase
        .from('dog_vet_clinics')
        .update({ is_primary: false })
        .eq('dog_id', dogId);
    }

    // Create or update dog-clinic relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('dog_vet_clinics')
      .upsert({
        dog_id: dogId,
        vet_clinic_id: clinic.id,
        is_primary: isPrimary,
        relationship_notes: relationshipNotes
      }, {
        onConflict: 'dog_id,vet_clinic_id'
      })
      .select()
      .single();

    if (relationshipError) {
      console.error('Relationship creation error:', relationshipError);
      return new Response(
        JSON.stringify({ error: 'Failed to create clinic relationship' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully upserted vet clinic and relationship');

    return new Response(
      JSON.stringify({ 
        clinic, 
        relationship,
        success: true 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upsert-vet-clinic function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});