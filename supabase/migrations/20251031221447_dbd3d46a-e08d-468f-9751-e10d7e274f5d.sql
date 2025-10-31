-- Add priority_order column to tricks table
ALTER TABLE tricks ADD COLUMN priority_order INTEGER;

-- Add new priority tricks for young puppies
INSERT INTO tricks (name, description, instructions, difficulty_level, category, prerequisites, estimated_time_weeks, priority_order) VALUES
('Zen Sit', 'Dog sits calmly and waits without fidgeting.', 'Build on Sit. Reward longer durations of calm sitting. Add distractions gradually.', 1, 'Obedience', '{"Sit"}', 1, 2),
('Zen Down', 'Dog lies down in a calm, relaxed state.', 'Build on Down. Reward relaxed body language. Increase duration and add distractions.', 1, 'Obedience', '{"Down (Lie Down)"}', 1, 3),
('Wait', 'Dog pauses and holds position briefly, different from Stay.', 'Similar to Stay but shorter duration. Dog waits at doors, before crossing streets. Release with "Okay".', 1, 'Obedience', '{"Sit"}', 1, 4),
('Wrong', 'Non-reward marker - indicates dog made wrong choice without punishment.', 'When dog makes wrong choice, say "Wrong" in neutral tone and withhold reward. Then redirect to correct behavior.', 1, 'Foundation', '{}', 1, 6),
('No', 'Inhibits unwanted behavior. Critical timing and tone.', 'IMPORTANT: Introduce only after solid foundation. Use firm but not harsh tone. Follow immediately with redirect to acceptable behavior. Never use harshly or frequently.', 2, 'Obedience', '{"Wrong"}', 2, 7),
('Leave It', 'Dog ignores item or distraction on cue.', 'Cover treat with hand. Say "Leave it". Reward when dog stops trying. Progress to uncovered treats.', 2, 'Obedience', '{"Wait"}', 2, 8),
('Off', 'Dog gets off furniture or stops jumping on people.', 'When dog jumps, turn away. Say "Off". Reward when four paws on ground. Consistent with all family.', 1, 'Obedience', '{}', 1, 9),
('Heel', 'Dog walks calmly beside handler at knee level.', 'Start in quiet area. Reward position at knee. Stop if dog pulls. Build duration and add distractions.', 3, 'Obedience', '{"Come / Recall"}', 3, 11),
('Nicely', 'Dog approaches people or things gently and calmly.', 'Use when dog gets excited. Reward calm, gentle behavior around people, food, toys. Consistent cue for self-control.', 2, 'Obedience', '{"Zen Sit", "Wait"}', 2, 13);

-- Update existing priority tricks with priority_order
UPDATE tricks SET priority_order = 1 WHERE name = 'Sit';
UPDATE tricks SET priority_order = 2 WHERE name = 'Down (Lie Down)';
UPDATE tricks SET priority_order = 5 WHERE name = 'Stay';
UPDATE tricks SET priority_order = 10 WHERE name = 'Settle / Place'; -- This is "On your mat/bed"
UPDATE tricks SET priority_order = 12 WHERE name = 'Come / Recall';

-- Create index for better query performance
CREATE INDEX idx_tricks_priority_order ON tricks(priority_order NULLS LAST);
