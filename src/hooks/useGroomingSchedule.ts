import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MOCK_GROOMING_SCHEDULES, isMockDogId } from "@/lib/mockData";

export interface GroomingSchedule {
  id: string;
  dog_id: string;
  grooming_type: string;
  frequency_days: number;
  last_completed_at: string | null;
  next_due_date: string | null;
  notes: string | null;
  how_to_video_url: string | null;
  how_to_guide: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroomingCompletion {
  id: string;
  schedule_id: string;
  dog_id: string;
  completed_at: string;
  notes: string | null;
  photos: string[] | null;
  created_at: string;
}

export const useGroomingSchedule = (dogId: string) => {
  const [schedules, setSchedules] = useState<GroomingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      // Dev mode bypass - return mock data
      if (isMockDogId(dogId)) {
        const mockSchedules = MOCK_GROOMING_SCHEDULES.filter(s => s.dog_id === dogId);
        setSchedules(mockSchedules);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("grooming_schedules")
        .select("*")
        .eq("dog_id", dogId)
        .order("grooming_type");

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error("Error fetching grooming schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load grooming schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGroomingGuide = (groomingType: string): string => {
    const guides: Record<string, string> = {
      full_grooming: `**Preparation**
Gather all necessary supplies: dog shampoo, towels, brush, and treats. Choose a warm, comfortable space for grooming.

**Step 1: Brush First**
Before bathing, thoroughly brush your dog's coat to remove tangles and loose fur. This makes washing easier and more effective.

**Step 2: Water Temperature**
Use lukewarm water - not too hot or cold. Test the water on your wrist first to ensure it's comfortable.

**Step 3: Wet the Coat**
Thoroughly wet your dog's coat, starting from the neck and working backwards. Avoid getting water in their ears and eyes.

**Step 4: Apply Shampoo**
Apply dog-specific shampoo and work into a lather. Massage gently from head to tail, getting down to the skin.

**Step 5: Rinse Thoroughly**
Rinse completely until water runs clear. Leftover shampoo can cause skin irritation.

**Step 6: Dry Your Dog**
Use towels to remove excess water. You can use a pet-safe blow dryer on low heat, keeping it moving and at a safe distance.

**Step 7: Final Brush**
Once dry, brush again to prevent matting and distribute natural oils through the coat.

**Tips**
- Use positive reinforcement throughout
- Keep sessions calm and relaxed
- Check for any skin issues while grooming`,

      teeth_brushing: `**Preparation**
Use dog-specific toothpaste (never human toothpaste) and a soft-bristled dog toothbrush or finger brush.

**Step 1: Get Your Dog Comfortable**
Let your dog sniff and lick the toothpaste from your finger. This helps them get used to the taste.

**Step 2: Introduce the Brush**
Let your dog smell and lick the toothbrush. Praise them for staying calm.

**Step 3: Lift the Lip**
Gently lift your dog's lip to expose their teeth and gums. Start with just a few seconds.

**Step 4: Brush the Outer Surfaces**
Focus on the outer surfaces of the teeth where plaque accumulates most. Use gentle circular motions.

**Step 5: Focus on the Back Teeth**
Pay special attention to the back molars, as these are most prone to tartar buildup.

**Step 6: Keep Sessions Short**
Start with 30 seconds and gradually increase duration as your dog becomes more comfortable.

**Step 7: End Positively**
Always end on a good note with praise and a treat (after brushing, not before!).

**Tips**
- Brush at least 2-3 times per week
- Be patient - it may take weeks to work up to a full brushing
- Watch for bleeding gums or bad breath and consult your vet if concerned`,

      nail_trimming: `**Preparation**
Use proper dog nail clippers (guillotine or scissor style) and have styptic powder ready in case of bleeding.

**Step 1: Get Your Dog Relaxed**
Choose a calm time when your dog is relaxed. Have treats ready for positive reinforcement.

**Step 2: Handle the Paws**
Gently hold your dog's paw and massage it. Get them comfortable with you touching their feet.

**Step 3: Identify the Quick**
On light-colored nails, you can see the pink quick inside. On dark nails, look for a small dark circle in the center of the nail as you trim.

**Step 4: Position the Clipper**
Hold the clipper at a 45-degree angle to the nail, cutting from top to bottom in a single smooth motion.

**Step 5: Trim Small Amounts**
Cut just the tip of the nail at first. It's better to trim less and do it more frequently.

**Step 6: Check Your Progress**
Look at the cut surface. If you see a dark spot in the center, you're getting close to the quick - stop there.

**Step 7: Smooth Sharp Edges**
Use a nail file or emery board to smooth any sharp edges after trimming.

**Tips**
- Trim nails every 3-4 weeks
- If you do cut the quick, apply styptic powder and apply pressure
- Consider doing one paw at a time if your dog gets anxious
- Always end with treats and praise`,

      ear_cleaning: `**Preparation**
Use a vet-approved ear cleaning solution and cotton balls or gauze. Never use cotton swabs inside the ear canal.

**Step 1: Inspect the Ears**
Check for redness, swelling, discharge, or foul odor. If present, consult your vet before cleaning.

**Step 2: Position Your Dog**
Have your dog sit or lie in a comfortable position where you can easily access their ears.

**Step 3: Apply Ear Cleaner**
Fill the ear canal with the cleaning solution as directed on the bottle. Don't be shy - it's designed to be used generously.

**Step 4: Massage the Base**
Gently massage the base of the ear for 20-30 seconds. You should hear a squishing sound.

**Step 5: Let Your Dog Shake**
Step back and let your dog shake their head. This helps bring debris up and out of the ear canal.

**Step 6: Wipe Away Debris**
Use cotton balls or gauze to gently wipe away the loosened debris from the outer ear and ear flap. Never push into the ear canal.

**Step 7: Dry the Outer Ear**
Gently dry the visible part of the ear with a clean, dry cotton ball.

**Tips**
- Clean ears after swimming or bathing
- Don't over-clean - once a week is usually sufficient for most dogs
- Watch for signs of ear infections between cleanings
- Some breeds with floppy ears may need more frequent cleaning`
    };

    return guides[groomingType] || '';
  };

  const addSchedule = async (
    groomingType: string,
    frequencyDays: number,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("grooming_schedules")
        .insert({
          dog_id: dogId,
          grooming_type: groomingType,
          frequency_days: frequencyDays,
          notes,
          how_to_guide: getGroomingGuide(groomingType),
        })
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) => [...prev, data]);
      toast({
        title: "Success",
        description: "Grooming schedule added",
      });
      return data;
    } catch (error: any) {
      console.error("Error adding grooming schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add grooming schedule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeGrooming = async (
    scheduleId: string,
    notes?: string,
    photos?: string[]
  ) => {
    try {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const now = new Date();
      const nextDue = new Date(now);
      nextDue.setDate(nextDue.getDate() + schedule.frequency_days);

      // Create completion record
      const { error: completionError } = await supabase
        .from("grooming_completions")
        .insert({
          schedule_id: scheduleId,
          dog_id: schedule.dog_id,
          completed_at: now.toISOString(),
          notes,
          photos,
        });

      if (completionError) throw completionError;

      // Update schedule
      const { data, error } = await supabase
        .from("grooming_schedules")
        .update({
          last_completed_at: now.toISOString(),
          next_due_date: nextDue.toISOString().split("T")[0],
        })
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? data : s))
      );

      toast({
        title: "Success",
        description: "Grooming completed",
      });
    } catch (error: any) {
      console.error("Error completing grooming:", error);
      toast({
        title: "Error",
        description: "Failed to complete grooming",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchCompletions = async (scheduleId: string): Promise<GroomingCompletion[]> => {
    try {
      const { data, error } = await supabase
        .from("grooming_completions")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching grooming completions:", error);
      return [];
    }
  };

  const updateSchedule = async (
    scheduleId: string,
    updates: Partial<GroomingSchedule>
  ) => {
    try {
      const { data, error } = await supabase
        .from("grooming_schedules")
        .update(updates)
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? data : s))
      );

      toast({
        title: "Success",
        description: "Schedule updated",
      });
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from("grooming_schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      toast({
        title: "Success",
        description: "Schedule deleted",
      });
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (dogId) {
      fetchSchedules();
    }
  }, [dogId]);

  return {
    schedules,
    loading,
    addSchedule,
    completeGrooming,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules,
    fetchCompletions,
  };
};
