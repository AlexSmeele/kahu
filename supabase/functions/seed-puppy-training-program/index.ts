import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Creating 8-Week Puppy Training Program...');

    // Create the main program
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .insert({
        name: '8-Week Puppy Foundation Program',
        description: 'A comprehensive training program designed for puppies starting at 8 weeks old. Covers essential foundations, basic skills, and common puppy behavior troubleshooting.',
        age_group: 'puppy',
        min_age_weeks: 8,
        max_age_weeks: 16,
        duration_weeks: 8,
        difficulty_level: 'beginner',
        is_published: true,
        order_index: 1
      })
      .select()
      .single();

    if (programError) throw programError;
    console.log('Program created:', program.id);

    // Week 1-2: Foundations
    const week1Data = {
      program_id: program.id,
      week_number: 1,
      title: 'Welcome Home & House Training',
      description: 'First week focuses on helping your puppy adjust to their new home and establishing house training routines.',
      focus_areas: ['foundations'],
      goals: [
        'Establish a consistent routine',
        'Begin house training process',
        'Create a safe environment',
        'Build trust and bonding'
      ],
      order_index: 1
    };

    const { data: week1, error: week1Error } = await supabase
      .from('training_program_weeks')
      .insert(week1Data)
      .select()
      .single();

    if (week1Error) throw week1Error;

    // Week 1 Lessons
    const week1Lessons = [
      {
        week_id: week1.id,
        title: 'Preparing Your Home for a Puppy',
        category: 'foundation',
        lesson_type: 'article',
        content: {
          sections: [
            {
              heading: 'Puppy-Proofing Checklist',
              content: 'Remove hazards, secure electrical cords, store chemicals safely, and create designated safe zones.'
            },
            {
              heading: 'Essential Supplies',
              content: 'Crate, bedding, food/water bowls, age-appropriate toys, collar and leash, identification tags.'
            },
            {
              heading: 'Safe Space Setup',
              content: 'Create a comfortable area where your puppy can retreat and feel secure.'
            }
          ],
          tips: [
            'Keep toxic plants out of reach',
            'Use baby gates to restrict access',
            'Have cleaning supplies ready for accidents'
          ]
        },
        estimated_minutes: 15,
        order_index: 1
      },
      {
        week_id: week1.id,
        title: 'House Training Basics',
        category: 'foundation',
        lesson_type: 'exercise',
        content: {
          overview: 'Establish a consistent routine for potty breaks to set your puppy up for success.',
          steps: [
            'Take puppy out first thing in the morning',
            'After meals (15-30 minutes)',
            'After naps',
            'After play sessions',
            'Before bedtime',
            'Use a specific potty command',
            'Reward immediately after success'
          ],
          schedule: {
            '7:00 AM': 'Morning potty break',
            '7:30 AM': 'Breakfast & water',
            '8:00 AM': 'Potty break',
            '10:00 AM': 'Potty break',
            '12:00 PM': 'Lunch & potty',
            '2:00 PM': 'Potty break',
            '5:00 PM': 'Dinner & potty',
            '7:00 PM': 'Potty break',
            '10:00 PM': 'Final potty break'
          },
          warnings: [
            'Never punish accidents',
            'Clean accidents thoroughly with enzymatic cleaner',
            'Watch for sniffing and circling behaviors'
          ]
        },
        estimated_minutes: 20,
        order_index: 2
      },
      {
        week_id: week1.id,
        title: 'Crate Training Introduction',
        category: 'foundation',
        lesson_type: 'exercise',
        content: {
          overview: 'Introduce the crate as a safe, positive space for your puppy.',
          steps: [
            'Place crate in a family area',
            'Leave door open initially',
            'Toss treats inside',
            'Feed meals in the crate',
            'Add comfortable bedding',
            'Gradually close door for short periods',
            'Never use crate as punishment'
          ],
          duration: 'Start with 5-10 minutes, gradually increase',
          tips: [
            'Cover crate partially for den-like feel',
            'Ignore whining for attention',
            'Remove collar before crating'
          ]
        },
        estimated_minutes: 15,
        order_index: 3
      }
    ];

    await supabase.from('training_program_lessons').insert(week1Lessons);

    // Week 2
    const week2Data = {
      program_id: program.id,
      week_number: 2,
      title: 'Socialization & Basic Handling',
      description: 'Critical socialization period begins. Expose puppy to new experiences positively.',
      focus_areas: ['foundations', 'skills'],
      goals: [
        'Introduce various sounds and sights',
        'Practice gentle handling',
        'Start name recognition',
        'Begin leash introduction'
      ],
      order_index: 2
    };

    const { data: week2, error: week2Error } = await supabase
      .from('training_program_weeks')
      .insert(week2Data)
      .select()
      .single();

    if (week2Error) throw week2Error;

    const week2Lessons = [
      {
        week_id: week2.id,
        title: 'Socialization Fundamentals',
        category: 'foundation',
        lesson_type: 'article',
        content: {
          importance: 'The first 16 weeks are critical for socialization. Positive experiences now shape your dog\'s temperament.',
          categories: [
            {
              name: 'People',
              examples: ['Different ages', 'Various appearances', 'Uniforms', 'Mobility aids']
            },
            {
              name: 'Other Animals',
              examples: ['Vaccinated dogs', 'Cats', 'Small animals (safely)']
            },
            {
              name: 'Environments',
              examples: ['Different surfaces', 'Indoor/outdoor', 'Various noise levels']
            },
            {
              name: 'Sounds',
              examples: ['Vacuum', 'TV', 'Car noises', 'Thunder (recordings)']
            }
          ],
          guidelines: [
            'Keep experiences positive',
            'Don\'t force interactions',
            'Watch puppy\'s body language',
            'End on a good note',
            'Treat for brave behavior'
          ]
        },
        estimated_minutes: 20,
        order_index: 1
      },
      {
        week_id: week2.id,
        title: 'Name Recognition Training',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          goal: 'Puppy turns and focuses on you when hearing their name',
          steps: [
            'Say puppy\'s name once',
            'When they look at you, mark with "Yes!" or click',
            'Give treat immediately',
            'Repeat 10-15 times per session',
            'Practice in different locations',
            'Gradually add distractions'
          ],
          common_mistakes: [
            'Repeating name multiple times',
            'Using name for punishment',
            'Not rewarding every time initially'
          ],
          practice_schedule: '3-5 short sessions daily'
        },
        estimated_minutes: 10,
        order_index: 2
      },
      {
        week_id: week2.id,
        title: 'Gentle Handling & Touch',
        category: 'foundation',
        lesson_type: 'exercise',
        content: {
          purpose: 'Prepare puppy for vet visits, grooming, and everyday handling',
          body_parts: [
            {
              area: 'Paws',
              technique: 'Touch each paw gently, reward, gradually hold longer'
            },
            {
              area: 'Ears',
              technique: 'Gently touch outside, lift ear flap, look inside, treat'
            },
            {
              area: 'Mouth',
              technique: 'Lift lips to see teeth, reward calm behavior'
            },
            {
              area: 'Tail',
              technique: 'Gentle touches along tail, never pull'
            },
            {
              area: 'Body',
              technique: 'Run hands over body, simulate grooming brushes'
            }
          ],
          tips: [
            'Keep sessions short (2-3 minutes)',
            'Always pair with treats',
            'Stop if puppy shows stress',
            'Practice daily'
          ]
        },
        estimated_minutes: 15,
        order_index: 3
      }
    ];

    await supabase.from('training_program_lessons').insert(week2Lessons);

    // Week 3-4: Basic Skills
    const week3Data = {
      program_id: program.id,
      week_number: 3,
      title: 'First Commands: Sit & Watch Me',
      description: 'Introduce your puppy\'s first formal commands and focus exercises.',
      focus_areas: ['skills'],
      goals: [
        'Master "Sit" command',
        'Learn "Watch Me" for attention',
        'Understand marker training',
        'Build impulse control'
      ],
      order_index: 3
    };

    const { data: week3, error: week3Error } = await supabase
      .from('training_program_weeks')
      .insert(week3Data)
      .select()
      .single();

    if (week3Error) throw week3Error;

    const week3Lessons = [
      {
        week_id: week3.id,
        title: 'Introduction to Clicker Training',
        category: 'skill',
        lesson_type: 'article',
        content: {
          what: 'A marker-based training method using a distinct sound to mark desired behaviors',
          why: 'Provides precise timing and clear communication',
          charging_the_clicker: [
            'Click, then immediately give treat',
            'Repeat 10-15 times',
            'Puppy should look for treat after click',
            'Practice until association is strong'
          ],
          alternatives: 'Can use verbal marker like "Yes!" or "Good!"',
          tips: [
            'Click at exact moment of correct behavior',
            'Click means treat is coming',
            'Keep treats small and high-value'
          ]
        },
        estimated_minutes: 15,
        order_index: 1
      },
      {
        week_id: week3.id,
        title: 'Teaching "Sit"',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          method: 'Lure Method',
          steps: [
            'Hold treat at puppy\'s nose',
            'Slowly move treat up and back over head',
            'As bottom touches ground, click/mark',
            'Give treat immediately',
            'Repeat 5-10 times',
            'Add verbal cue "Sit" once behavior is reliable',
            'Practice in different locations'
          ],
          progression: [
            'Week 1: Lure every time',
            'Week 2: Fade lure, use hand signal',
            'Week 3: Add verbal cue',
            'Week 4: Practice with distractions'
          ],
          troubleshooting: {
            'Puppy jumps up': 'Lure is too high, keep closer to nose',
            'Puppy backs up': 'Lure is moving too fast',
            'Won\'t sit': 'Try in corner where backing up is prevented'
          }
        },
        estimated_minutes: 10,
        order_index: 2
      },
      {
        week_id: week3.id,
        title: 'Building Focus with "Watch Me"',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          purpose: 'Teach puppy to make eye contact on cue, essential for advanced training',
          steps: [
            'Hold treat at your eye level',
            'Say "Watch Me"',
            'When puppy makes eye contact, click/mark',
            'Give treat',
            'Start with 1-2 seconds of eye contact',
            'Gradually increase duration',
            'Practice before distractions'
          ],
          games: [
            'Eye contact game: Reward any offered eye contact',
            'Name game: Say name, reward for looking',
            'Find my face: Make silly noises to get attention'
          ],
          duration_goals: {
            'Week 1': '1-2 seconds',
            'Week 2': '3-5 seconds',
            'Week 3': '5-10 seconds',
            'Week 4': '10+ seconds with distractions'
          }
        },
        estimated_minutes: 10,
        order_index: 3
      }
    ];

    await supabase.from('training_program_lessons').insert(week3Lessons);

    // Week 4
    const week4Data = {
      program_id: program.id,
      week_number: 4,
      title: 'Recall & Leash Introduction',
      description: 'Teach reliable recall and introduce leash walking basics.',
      focus_areas: ['skills'],
      goals: [
        'Strong recall in controlled environment',
        'Comfortable wearing collar and leash',
        'Basic leash walking without pulling',
        'Reinforce previous skills'
      ],
      order_index: 4
    };

    const { data: week4, error: week4Error } = await supabase
      .from('training_program_weeks')
      .insert(week4Data)
      .select()
      .single();

    if (week4Error) throw week4Error;

    const week4Lessons = [
      {
        week_id: week4.id,
        title: 'Teaching Reliable Recall',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          importance: 'Life-saving command that every dog must know',
          foundation_steps: [
            'Choose recall word ("Come" or "Here")',
            'Start indoors with no distractions',
            'Say name + recall word once',
            'Run backwards or squat down',
            'Reward enthusiastically when puppy comes',
            'Never call for something unpleasant',
            'Practice 10-20 times daily'
          ],
          recall_games: [
            {
              name: 'Puppy Ping Pong',
              description: 'Two people take turns calling puppy back and forth'
            },
            {
              name: 'Hide and Seek',
              description: 'Hide and call puppy to find you'
            },
            {
              name: 'Treat Trail',
              description: 'Drop treats while walking away, puppy follows'
            }
          ],
          rules: [
            'NEVER call puppy to punish',
            'NEVER chase if they don\'t come',
            'ALWAYS reward coming',
            'Use different treat levels based on difficulty'
          ],
          progression: 'Indoor → Fenced yard → Long line → Off-leash (takes months)'
        },
        estimated_minutes: 15,
        order_index: 1
      },
      {
        week_id: week4.id,
        title: 'Leash and Collar Introduction',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          collar_introduction: [
            'Let puppy sniff collar first',
            'Put on for short periods during play',
            'Gradually increase wearing time',
            'Check fit: Two fingers should fit under collar'
          ],
          leash_introduction: [
            'Attach leash while puppy is distracted',
            'Let them drag it supervised',
            'Pick up leash, give treats',
            'Take few steps, reward',
            'Keep sessions short and positive'
          ],
          first_walks: [
            'Practice indoors first',
            'Use high-value treats',
            'Keep sessions 3-5 minutes',
            'End before puppy gets frustrated',
            'Goal is building positive association'
          ],
          equipment: 'Use flat collar or harness, avoid retractable leashes initially'
        },
        estimated_minutes: 15,
        order_index: 2
      }
    ];

    await supabase.from('training_program_lessons').insert(week4Lessons);

    // Week 5-6: Troubleshooting
    const week5Data = {
      program_id: program.id,
      week_number: 5,
      title: 'Puppy Biting & Mouthing',
      description: 'Address normal but problematic puppy biting behavior.',
      focus_areas: ['troubleshooting'],
      goals: [
        'Understand why puppies bite',
        'Implement bite inhibition training',
        'Redirect to appropriate items',
        'Manage arousal levels'
      ],
      order_index: 5
    };

    const { data: week5, error: week5Error } = await supabase
      .from('training_program_weeks')
      .insert(week5Data)
      .select()
      .single();

    if (week5Error) throw week5Error;

    const week5Lessons = [
      {
        week_id: week5.id,
        title: 'Understanding Puppy Biting',
        category: 'troubleshooting',
        lesson_type: 'article',
        content: {
          why_puppies_bite: [
            'Teething (begins around 3-4 months)',
            'Play behavior (how they interact with littermates)',
            'Exploration (puppies explore with mouths)',
            'Attention seeking',
            'Overstimulation/overtiredness'
          ],
          normal_vs_concerning: {
            normal: 'Playful mouthing, stops with yelp, responds to redirection',
            concerning: 'Growling with bites, stiff body, hard bites that don\'t stop'
          },
          timeline: 'Most puppies grow out of biting by 6-8 months with consistent training',
          realistic_expectations: 'Biting won\'t stop overnight, requires consistent 4-6 weeks of training'
        },
        estimated_minutes: 10,
        order_index: 1
      },
      {
        week_id: week5.id,
        title: 'Bite Inhibition Training',
        category: 'troubleshooting',
        lesson_type: 'exercise',
        content: {
          what: 'Teaching puppy to control force of their bite',
          why: 'Even with training, dogs may bite in fear or pain. Bite inhibition reduces injury severity.',
          technique: [
            'Allow gentle mouthing during play',
            'When bite is too hard, say "Ouch!" in high pitch',
            'Immediately stop all interaction',
            'Turn away or leave room for 10-30 seconds',
            'Return and resume play',
            'Repeat every time bite is too hard',
            'Gradually lower threshold for what\'s acceptable'
          ],
          phases: [
            'Phase 1: Reduce hard bites (weeks 1-2)',
            'Phase 2: Reduce moderate bites (weeks 3-4)',
            'Phase 3: Eliminate all mouthing (weeks 5-8)'
          ],
          tips: [
            'Consistency is key - everyone must respond same way',
            'Don\'t roughhouse if it increases biting',
            'Have appropriate chew toys always available'
          ]
        },
        estimated_minutes: 15,
        order_index: 2
      },
      {
        week_id: week5.id,
        title: 'Redirection Techniques',
        category: 'troubleshooting',
        lesson_type: 'exercise',
        content: {
          principle: 'Give puppy something appropriate to bite instead',
          strategy: [
            'Keep toys easily accessible everywhere',
            'Have variety: soft, hard, rope, squeaky',
            'Rotate toys to keep interest',
            'When puppy bites you, redirect to toy',
            'Praise enthusiastically when they chew toy',
            'Frozen toys help with teething pain'
          ],
          appropriate_items: [
            'Rubber chew toys (Kong, Nylabone)',
            'Rope toys',
            'Frozen washcloths',
            'Puppy-safe stuffed toys',
            'Bully sticks (supervised)'
          ],
          management: [
            'Prevent access to inappropriate items',
            'Exercise before high-bite times (evening often worst)',
            'Enforce nap times - tired puppies bite more',
            'Keep hands in pockets when puppy is aroused'
          ]
        },
        estimated_minutes: 15,
        order_index: 3
      }
    ];

    await supabase.from('training_program_lessons').insert(week5Lessons);

    // Week 6
    const week6Data = {
      program_id: program.id,
      week_number: 6,
      title: 'Jumping & Overexcitement',
      description: 'Manage jumping behavior and teach calm greetings.',
      focus_areas: ['troubleshooting'],
      goals: [
        'Prevent jumping from becoming habit',
        'Teach alternative greeting behaviors',
        'Manage arousal and excitement',
        'Reinforce calm behavior'
      ],
      order_index: 6
    };

    const { data: week6, error: week6Error } = await supabase
      .from('training_program_weeks')
      .insert(week6Data)
      .select()
      .single();

    if (week6Error) throw week6Error;

    const week6Lessons = [
      {
        week_id: week6.id,
        title: 'Why Puppies Jump',
        category: 'troubleshooting',
        lesson_type: 'article',
        content: {
          reasons: [
            'Seeking attention and face-to-face contact',
            'Excitement and greeting behavior',
            'Works! (gets reaction from people)',
            'Natural behavior - puppies greet adult dogs faces'
          ],
          why_its_problematic: [
            'Can knock over children or elderly',
            'Muddy paws on clothes',
            'Can scare visitors',
            'Harder to stop when dog is full-grown'
          ],
          key_principle: 'Dogs repeat behaviors that work. Remove reward (attention) for jumping.'
        },
        estimated_minutes: 10,
        order_index: 1
      },
      {
        week_id: week6.id,
        title: 'Teaching "Four on the Floor"',
        category: 'troubleshooting',
        lesson_type: 'exercise',
        content: {
          concept: 'Reward puppy for keeping all four paws on ground',
          protocol: [
            'Approach puppy',
            'If they sit or stand calmly, reward',
            'If they jump, turn away completely',
            'Wait for four paws on floor',
            'Turn back and reward',
            'Repeat until puppy stops trying to jump'
          ],
          consistency_rules: [
            'NO attention when jumping (not even pushing away)',
            'ALWAYS reward four on floor',
            'Everyone must follow same rules',
            'Be patient - may get worse before better'
          ],
          alternative_behaviors: [
            'Teach "Sit" for greetings',
            'Reward lying down when excited',
            'Hold toy in mouth (can\'t jump with full mouth)'
          ],
          practice_scenarios: [
            'Coming home',
            'Before meals',
            'When guests arrive',
            'Before going outside'
          ]
        },
        estimated_minutes: 15,
        order_index: 2
      },
      {
        week_id: week6.id,
        title: 'Capturing Calm Behavior',
        category: 'troubleshooting',
        lesson_type: 'exercise',
        content: {
          importance: 'Puppies need to learn that calm behavior gets rewards too',
          protocol: [
            'Watch for any calm behavior (lying down, settling)',
            'Quietly mark with "Yes" or click',
            'Calmly deliver treat',
            'Don\'t make big fuss (keeps them calm)',
            'Repeat throughout day'
          ],
          calm_training_games: [
            {
              name: 'Relaxation Protocol',
              description: 'Reward puppy for staying on mat while you move around'
            },
            {
              name: 'Go to Your Bed',
              description: 'Send puppy to bed, reward for staying there'
            },
            {
              name: 'Settle During TV',
              description: 'Reward periodic calm behavior during evening relaxation'
            }
          ],
          environmental_management: [
            'Provide comfortable rest areas',
            'Reduce overstimulation',
            'Enforce adequate sleep (18-20 hours for puppies)',
            'Calm music can help',
            'Maintain predictable routine'
          ]
        },
        estimated_minutes: 15,
        order_index: 3
      }
    ];

    await supabase.from('training_program_lessons').insert(week6Lessons);

    // Week 7-8: Advanced Foundations & Integration
    const week7Data = {
      program_id: program.id,
      week_number: 7,
      title: 'Loose Leash Walking & Stay',
      description: 'Build on previous skills with loose leash walking and introducing "Stay".',
      focus_areas: ['skills', 'foundations'],
      goals: [
        'Walk on loose leash without pulling',
        'Understand "Stay" concept',
        'Practice in more distracting environments',
        'Build duration and distance'
      ],
      order_index: 7
    };

    const { data: week7, error: week7Error } = await supabase
      .from('training_program_weeks')
      .insert(week7Data)
      .select()
      .single();

    if (week7Error) throw week7Error;

    const week7Lessons = [
      {
        week_id: week7.id,
        title: 'Loose Leash Walking Fundamentals',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          goal: 'Puppy walks with slack in leash, at your side',
          why_puppies_pull: [
            'They want to explore',
            'Walking faster than you',
            'Pulling works - gets them where they want',
            'Excitement about the walk'
          ],
          training_method: [
            'Start walking',
            'When puppy pulls, immediately stop',
            'Wait for them to look back or return',
            'Mark and reward',
            'Take few steps, repeat',
            'Change directions frequently',
            'Reward frequently when leash is loose'
          ],
          advanced_techniques: [
            'Stop and Go: Stop every time leash tightens',
            'Direction Changes: Turn opposite direction when pulling',
            'Penalty Yards: Back up a few steps when pulling occurs',
            '300 Peck Method: Reward every few steps of loose leash'
          ],
          tips: [
            'Practice in low-distraction area first',
            'Keep sessions short (5-10 minutes)',
            'Use high-value treats',
            'Don\'t expect perfect walks yet',
            'Exercise puppy before training walks'
          ]
        },
        estimated_minutes: 20,
        order_index: 1
      },
      {
        week_id: week7.id,
        title: 'Introduction to "Stay"',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          what: 'Puppy remains in position until released',
          three_ds: {
            duration: 'How long they stay',
            distance: 'How far you move away',
            distraction: 'What\'s happening around them'
          },
          teaching_steps: [
            'Ask for "Sit"',
            'Say "Stay" with palm toward puppy',
            'Count 2 seconds',
            'Say release word ("Okay!" or "Free!")',
            'Reward',
            'Gradually increase duration',
            'Then add distance (one step back)',
            'Finally add distractions'
          ],
          common_mistakes: [
            'Increasing duration and distance at same time',
            'Moving too fast in progression',
            'Not using release word',
            'Rewarding after puppy breaks stay'
          ],
          release_word_importance: 'Teaches puppy they must wait for permission',
          progression_timeline: {
            'Week 1': '5-10 seconds, no distance',
            'Week 2': '30 seconds, 1-2 steps away',
            'Week 3': '1 minute, 5 steps away',
            'Week 4': '2 minutes, out of sight briefly'
          }
        },
        estimated_minutes: 15,
        order_index: 2
      }
    ];

    await supabase.from('training_program_lessons').insert(week7Lessons);

    // Week 8
    const week8Data = {
      program_id: program.id,
      week_number: 8,
      title: 'Program Review & Next Steps',
      description: 'Consolidate all learned skills and plan for continued training.',
      focus_areas: ['foundations', 'skills', 'troubleshooting'],
      goals: [
        'Review and strengthen all commands',
        'Test skills with distractions',
        'Identify areas needing more work',
        'Plan for ongoing training'
      ],
      order_index: 8
    };

    const { data: week8, error: week8Error } = await supabase
      .from('training_program_weeks')
      .insert(week8Data)
      .select()
      .single();

    if (week8Error) throw week8Error;

    const week8Lessons = [
      {
        week_id: week8.id,
        title: 'Skills Assessment Checklist',
        category: 'foundation',
        lesson_type: 'article',
        content: {
          assessment_areas: [
            {
              skill: 'House Training',
              mastery_indicators: [
                'Few to no accidents',
                'Signals when needs to go out',
                'Can hold it appropriate time for age'
              ]
            },
            {
              skill: 'Crate Training',
              mastery_indicators: [
                'Enters crate willingly',
                'Settles quietly',
                'Can stay 2-3 hours during day'
              ]
            },
            {
              skill: 'Name Recognition',
              mastery_indicators: [
                'Turns immediately when name called',
                'Makes eye contact',
                'Responds with distractions present'
              ]
            },
            {
              skill: 'Sit',
              mastery_indicators: [
                'Sits on verbal cue alone',
                'Holds sit for 10+ seconds',
                'Responds in different locations'
              ]
            },
            {
              skill: 'Recall',
              mastery_indicators: [
                'Comes when called indoors reliably',
                'Comes in fenced yard with distractions',
                'Shows enthusiasm when coming'
              ]
            },
            {
              skill: 'Leash Walking',
              mastery_indicators: [
                'Walks without pulling most of the time',
                'Checks in with you regularly',
                'Can walk calmly past mild distractions'
              ]
            },
            {
              skill: 'Bite Inhibition',
              mastery_indicators: [
                'Biting incidents decreased significantly',
                'Responds to "Ouch" by stopping',
                'Seeks appropriate toys'
              ]
            },
            {
              skill: 'Jumping Management',
              mastery_indicators: [
                'Sits for greetings sometimes',
                'Four on floor behavior increasing',
                'Responds to redirection'
              ]
            }
          ],
          next_steps: 'Focus intensive training on areas below mastery level'
        },
        estimated_minutes: 15,
        order_index: 1
      },
      {
        week_id: week8.id,
        title: 'Continuing Your Training Journey',
        category: 'foundation',
        lesson_type: 'article',
        content: {
          congratulations: 'You\'ve completed 8 weeks of foundational training! Your puppy now has the building blocks for a lifetime of learning.',
          next_programs: [
            {
              name: 'Adolescent Training (4-12 months)',
              focus: 'Managing teenage behaviors, advanced obedience, impulse control'
            },
            {
              name: 'Advanced Skills & Tricks',
              focus: 'Fun tricks, retrieve, agility basics, scent work introduction'
            },
            {
              name: 'Reactive Dog Training',
              focus: 'If your puppy shows fear or reactivity to specific triggers'
            }
          ],
          ongoing_training_tips: [
            'Practice commands daily in 5-10 minute sessions',
            'Continue socialization throughout first year',
            'Enroll in puppy class for social learning',
            'Add new tricks to keep training fun',
            'Maintain consistency with rules',
            'Gradually increase difficulty and distractions'
          ],
          common_challenges_ahead: [
            'Adolescent phase (6-18 months): May "forget" training',
            'Fear periods: May become wary of new things',
            'Teething continues until 6 months',
            'Energy levels increase - need more exercise'
          ],
          resources: [
            'Consider professional trainer for specific issues',
            'Join local dog training clubs',
            'Continue reading and learning',
            'Connect with positive reinforcement training community'
          ]
        },
        estimated_minutes: 15,
        order_index: 2
      },
      {
        week_id: week8.id,
        title: 'Final Practice Session',
        category: 'skill',
        lesson_type: 'exercise',
        content: {
          purpose: 'Put all skills together in a comprehensive training session',
          session_structure: [
            {
              duration: '5 minutes',
              activity: 'Warm-up: Name game and Watch Me'
            },
            {
              duration: '10 minutes',
              activity: 'Obedience sequence: Sit, Stay, Come, Sit, Stay, Release'
            },
            {
              duration: '10 minutes',
              activity: 'Leash walking practice with turns and stops'
            },
            {
              duration: '5 minutes',
              activity: 'Distraction work: Practice commands while someone walks by'
            },
            {
              duration: '5 minutes',
              activity: 'Free play and fun tricks'
            },
            {
              duration: '5 minutes',
              activity: 'Cool down: Gentle handling and calm settling'
            }
          ],
          success_criteria: [
            'Puppy remains engaged throughout',
            'Responds to most cues first time',
            'Shows enjoyment of training',
            'Can work despite mild distractions'
          ],
          celebration: 'Take video of your final session to see progress, give extra special treats, have play session!'
        },
        estimated_minutes: 40,
        order_index: 3
      }
    ];

    await supabase.from('training_program_lessons').insert(week8Lessons);

    console.log('8-Week Puppy Training Program created successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: '8-Week Puppy Training Program created successfully',
        program_id: program.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error creating program:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
