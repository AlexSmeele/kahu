-- Add how-to instructional fields to grooming_schedules table
ALTER TABLE public.grooming_schedules
ADD COLUMN how_to_video_url text,
ADD COLUMN how_to_guide text;