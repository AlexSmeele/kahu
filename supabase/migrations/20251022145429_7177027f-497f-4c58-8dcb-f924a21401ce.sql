-- Add overdue Cytopoint injection record for Suki
INSERT INTO vaccination_records (
  dog_id,
  vaccine_id,
  administered_date,
  due_date,
  notes
) VALUES (
  'b450a8fe-855c-4176-b9bc-8da19de0ec30'::uuid, -- Suki's ID
  '102c51a6-c90a-46a6-a5e2-694cb28ba7c3'::uuid, -- Cytopoint vaccine ID
  CURRENT_DATE - INTERVAL '6 weeks',  -- Last injection was 6 weeks ago
  CURRENT_DATE - INTERVAL '2 weeks',  -- Was due 2 weeks ago (now overdue!)
  'Cytopoint injection for seasonal allergies'
);