-- Drop the existing difficulty level check constraint and update it
ALTER TABLE tricks DROP CONSTRAINT IF EXISTS tricks_difficulty_level_check;

-- Add new difficulty level constraint to support levels 1-10
ALTER TABLE tricks ADD CONSTRAINT tricks_difficulty_level_check 
CHECK (difficulty_level >= 1 AND difficulty_level <= 10);

-- Clear existing tricks and populate with comprehensive list
DELETE FROM tricks;

-- Insert all 40 tricks
INSERT INTO tricks (name, description, instructions, difficulty_level, category, prerequisites, estimated_time_weeks) VALUES
('Sit', 'Dog lowers haunches to sit.', 'Lure with treat from nose upward. Reward when butt touches ground. Add ''Sit'' cue.', 1, 'Obedience', '{}', 1),
('Down (Lie Down)', 'Dog lies flat on the ground.', 'From sit, lure treat to floor between paws. Reward when dog lies fully.', 1, 'Obedience', '{"Sit"}', 1),
('Touch / Target', 'Dog touches nose to hand or object.', 'Present target, reward nose touches. Add cue ''Touch.''', 1, 'Foundation / Prop Work', '{}', 1),
('Come / Recall', 'Dog comes when called.', 'Call name happily with ''Come.'' Reward generously. Start short, progress with distractions.', 1, 'Obedience', '{}', 2),
('Shake / Paw', 'Dog offers paw to shake hands.', 'Lift paw gently saying ''Shake.'' Reward. Repeat until dog offers paw voluntarily.', 1, 'Performance', '{"Sit"}', 1),
('High Five', 'Dog touches raised hand with paw.', 'Start with Shake, raise hand higher. Reward paw contact.', 1, 'Performance', '{"Shake / Paw"}', 1),
('Spin / Twirl', 'Dog turns in a circle.', 'Lure treat in circle around nose. Reward full rotation. Add ''Spin'' cue.', 1, 'Performance', '{"Touch"}', 1),
('Stay', 'Dog holds position until released.', 'Ask sit/down. Hold palm up. Step back, reward if dog stays. Gradually increase duration and distance.', 2, 'Obedience', '{"Sit", "Down"}', 2),
('Wait for Food', 'Dog waits before eating until released.', 'Hold bowl, say ''Wait.'' Lower bowl. Lift if dog lunges. Release with ''Okay.''', 2, 'Obedience', '{"Stay"}', 2),
('Settle / Place', 'Dog lies calmly on a mat/bed.', 'Guide dog to mat, reward when lying. Add duration. Cue ''Place.''', 2, 'Obedience', '{"Down"}', 2),
('Roll Over', 'Dog rolls onto back and over.', 'From down, lure head to shoulder then over back. Reward each step.', 3, 'Body Control', '{"Down"}', 2),
('Play Dead / Bang', 'Dog lies motionless on side.', 'From down, lure onto side. Add ''Bang'' cue or hand signal.', 3, 'Performance', '{"Down"}', 2),
('Speak / Quiet', 'Dog barks on cue, stops on cue.', 'Capture bark with ''Speak.'' Reinforce. Add ''Quiet'' with reward when silent.', 3, 'Performance', '{}', 2),
('Crawl', 'Dog moves forward while lying down.', 'From down, lure under low object. Reward small scoots.', 3, 'Body Control', '{"Down"}', 2),
('Fetch / Retrieve', 'Dog fetches toy and returns it.', 'Toss toy, encourage return. Trade for treat. Extend distance gradually.', 3, 'Prop Work', '{"Touch"}', 2),
('Bow (Take a Bow)', 'Dog stretches front legs down, rear up.', 'Capture natural bow. Or lure nose down while rear stays up. Reward.', 3, 'Performance', '{}', 1),
('Peekaboo / Between Legs', 'Dog stands or sits between handler''s legs.', 'Lure through legs, reward. Add cue ''Peekaboo.''', 3, 'Performance', '{"Touch"}', 1),
('Weave Between Legs (Walking)', 'Dog weaves figure-8 between handler''s legs while walking.', 'Lure around each leg, reward. Build rhythm, fade lure.', 4, 'Body Control', '{"Touch"}', 2),
('Wave', 'Dog lifts paw and waves in the air.', 'From Shake, delay hand so dog swats mid-air. Mark/reward.', 3, 'Performance', '{"Shake / Paw"}', 1),
('Carry Item', 'Dog carries toy or basket.', 'Teach hold. Reward duration. Add ''Carry'' cue, extend distance.', 4, 'Prop Work', '{"Fetch / Retrieve"}', 2),
('Back Up', 'Dog walks backward on cue.', 'Step toward dog. Reward backward step. Add ''Back'' cue, fade handler movement.', 5, 'Body Control', '{"Stay"}', 2),
('Jump Through Hoop', 'Dog leaps through hoop.', 'Start with hoop on ground, lure through. Gradually raise height.', 5, 'Prop Work', '{"Touch"}', 2),
('Figure Eight Around Legs', 'Dog weaves figure-eight around stationary legs.', 'Lure around each leg. Reward at center. Add cue.', 5, 'Body Control', '{"Weave Between Legs (Walking)"}', 2),
('Open / Close Door', 'Dog pushes or pulls door.', 'Attach tug toy. Teach pull open. For close, teach nose/paw push.', 6, 'Prop Work', '{"Touch", "Fetch / Retrieve"}', 4),
('Turn Lights On/Off', 'Dog flips light switch.', 'Target stick to switch. Reward contact. Add ''Light'' cue.', 6, 'Prop Work', '{"Touch"}', 4),
('Skateboard / Push Object', 'Dog pushes skateboard or cart.', 'Shape paw pushes. Reward movement. Increase distance.', 6, 'Prop Work', '{"Touch"}', 4),
('Balance Treat on Nose', 'Dog holds treat on nose until released.', 'Hold treat briefly on nose. Release quickly. Build duration.', 5, 'Impulse Control', '{"Stay"}', 2),
('Walk on Hind Legs', 'Dog stands or walks upright.', 'Lure upward from sit. Reward standing. Gradually add steps.', 6, 'Body Control', '{"Sit"}', 4),
('Basketball (Ball in Hoop)', 'Dog puts ball into hoop.', 'Teach hold, then drop over hoop. Reward successful drops.', 6, 'Prop Work', '{"Fetch / Retrieve", "Carry Item"}', 2),
('Ring Bell to Go Outside', 'Dog rings bell to potty.', 'Teach Touch on bell. Reward only before going outside.', 5, 'Practical', '{"Touch"}', 2),
('Retrieve Specific Items', 'Dog fetches named items on cue.', 'Teach one item''s name. Add second item, discriminate. Expand vocabulary gradually.', 8, 'Practical', '{"Fetch / Retrieve"}', 4),
('Tidy Up / Put Toys Away', 'Dog puts toys into basket.', 'Teach hold/drop. Position basket. Reward each placement.', 8, 'Practical', '{"Carry Item"}', 4),
('Dance / Spin on Hind Legs', 'Dog spins while standing upright.', 'Build hind leg stand. Lure circle. Add ''Dance'' cue.', 9, 'Performance', '{"Walk on Hind Legs"}', 4),
('Say Prayers', 'Dog rests head on paws or object.', 'Use target, shape lowering head onto paws/object. Add ''Pray'' cue.', 7, 'Performance', '{"Down"}', 2),
('Skateboard Riding / Surfing', 'Dog balances/rides moving object.', 'Shape standing on stable skateboard. Reward balance. Slowly add movement.', 10, 'Prop Work', '{"Skateboard / Push Object"}', 4),
('Handstand', 'Dog balances on front paws.', 'Shape back legs onto wall. Reward. Build strength. Fade wall gradually.', 10, 'Body Control', '{"Back Up"}', 4),
('Back Weave', 'Dog weaves backward through handler''s legs.', 'Use Back cue and lure through legs. Reward each section.', 9, 'Body Control', '{"Back Up", "Weave Between Legs (Walking)"}', 4),
('Jump into Arms', 'Dog leaps safely into handler''s arms.', 'Teach Up onto low surface. Transition to arms. Only for confident dogs.', 9, 'Performance', '{"Jump Through Hoop"}', 4),
('Play Piano / Keyboard', 'Dog presses keys with paws.', 'Teach Paw on keys. Reward sounds. Add ''Play'' cue.', 8, 'Prop Work', '{"Touch"}', 2),
('Complex Chains', 'Dog performs multi-step routines (fetch drink, close fridge, deliver).', 'Train each step individually. Chain tasks together. Reinforce entire routine.', 10, 'Chain', '{"Retrieve Specific Items", "Open / Close Door"}', 4);