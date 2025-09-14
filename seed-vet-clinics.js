// Temporary script to seed vet clinics
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bhkqdxhyceflfesxrztm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3FkeGh5Y2VmbGZlc3hyenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODQ3OTEsImV4cCI6MjA3MTI2MDc5MX0.JmUM-TE9VJ9nA9W2hkmYe1LxvMsJR9REAw4r49UZNFA'
);

async function seedVetClinics() {
  console.log('Calling admin-seed-vet-clinics function...');
  
  const { data, error } = await supabase.functions.invoke('admin-seed-vet-clinics', {
    body: {
      region: 'new-zealand',
      limit: 50
    }
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Success:', data);
}

seedVetClinics();