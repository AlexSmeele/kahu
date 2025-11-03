-- Seed course modules
INSERT INTO public.course_modules (id, title, description, estimated_minutes, order_index, tags) VALUES
('00000000-0000-0000-0000-000000000001', 'Readiness & Commitment', 'Understand the long-term commitment of dog ownership and assess your readiness', 15, 1, '["readiness", "commitment", "lifespan"]'),
('00000000-0000-0000-0000-000000000002', 'Financial & Logistics', 'Plan your budget and understand the costs of dog ownership', 20, 2, '["finance", "budget", "logistics"]'),
('00000000-0000-0000-0000-000000000003', 'Choosing the Right Dog', 'Learn how to match your lifestyle with the perfect dog', 20, 3, '["breed", "lifestyle", "matching"]'),
('00000000-0000-0000-0000-000000000004', 'Care & Welfare Essentials (Part A)', 'Master nutrition, health, and veterinary care basics', 20, 4, '["health", "nutrition", "vet"]'),
('00000000-0000-0000-0000-000000000005', 'Care & Welfare Essentials (Part B)', 'Learn about exercise, enrichment, and body language', 20, 5, '["exercise", "behavior", "grooming"]'),
('00000000-0000-0000-0000-000000000006', 'Bringing Your Dog Home', 'Prepare for the first days and weeks with your new companion', 20, 6, '["preparation", "first_days", "routine"]')
ON CONFLICT (id) DO NOTHING;