# Skills Data Mapping Documentation

## CSV → Database → Frontend Data Flow

### Column Mappings

| CSV Column | Database Column | Frontend Interface | Notes |
|------------|----------------|-------------------|-------|
| Name | name | name | Direct mapping |
| Category | category | category | e.g., "Foundational / Obedience" |
| Category (parsed) | skill_type | - | Extracted from category, must be: 'obedience', 'body_control', 'practical', 'performance' |
| Difficulty | difficulty_level | difficulty_level | Mapped: Beginner=1, Intermediate=3, Advanced=5 |
| Estimated Time | estimated_time_weeks | estimated_time_weeks | Parsed from "1-2 weeks" → average |
| Short Description | short_description | short_description | Direct mapping |
| Long Description | long_description | long_description | Direct mapping |
| Brief Instructions Step 1-3 | brief_instructions | brief_instructions | JSONB array of step objects |
| Detailed Instructions Step 1-5 | detailed_instructions | detailed_instructions | JSONB array of step objects |
| General Tips | general_tips | general_tips | Direct mapping |
| Troubleshooting | troubleshooting | troubleshooting | Direct mapping |
| Prerequisites | prerequisites | prerequisites | Array of skill names |
| Preparation Tips | preparation_tips | preparation_tips | Direct mapping |
| Training Insights | training_insights | training_insights | Direct mapping |
| Achievement Level 1-3 | achievement_levels | achievement_levels | JSONB: {level1, level2, level3} |
| Ideal Stage Level 1-3 | ideal_stage_timeline | ideal_stage_timeline | JSONB: {level1, level2, level3} with week numbers |
| Pass Criteria | pass_criteria | pass_criteria | Direct mapping |
| Fail Criteria | fail_criteria | fail_criteria | Direct mapping |
| Mastery Criteria | mastery_criteria | mastery_criteria | Direct mapping |

### Instructions Format

Instructions are stored as JSONB arrays with this structure:
```typescript
{
  number: number;    // Step number (1, 2, 3, etc.)
  title: string;     // "Step 1", "Step 2", etc.
  content: string;   // The actual instruction text
  tip?: string;      // Optional tip
}
```

### Skill Type Constraint

The database has a check constraint: `skill_type` must be one of:
- 'obedience'
- 'performance'
- 'practical'
- 'body_control'
- NULL

The edge function extracts this from the category field.

### Core Skill UUIDs (Preserved)

These skill IDs are hardcoded to maintain compatibility with existing roadmap data:
- Sit: `bbc0357d-2d9e-4ae1-8ac8-e9af77a82852`
- Down: `fffa5ef5-83e6-4839-92e1-e1badbd88887`
- Stay: `d3fff6a0-871d-40eb-91ae-dd4e2cc6780b`
- Come: `25cafc44-6396-4c3a-b6de-d203656eac71`
- Leave It: `46950108-abb8-48e4-86c4-fd0367e514eb`
- Heel: `8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7`

### Frontend Usage

**SkillDetailPage.tsx:**
- Displays: name, category, difficulty_level (as stars), short_description, long_description
- Shows prerequisites as a checklist
- Displays preparation_tips, training_insights in collapsible sections
- Uses achievement_levels and ideal_stage_timeline for proficiency tracking

**InstructionalPage.tsx:**
- Expects instructions as arrays of step objects
- Renders each step with image placeholder, title, content, and optional tip
- Supports horizontal scrolling/swiping through steps

**TrainingSessionPage.tsx:**
- Uses general_tips and troubleshooting for in-session guidance
- Records practice sessions against dog_skills table

### Type Safety

All data uses TypeScript type assertions (`as unknown as Type`) to handle the mismatch between Supabase's generic `Json` type and our specific interfaces. This is necessary because Supabase cannot infer the exact structure of JSONB columns.
