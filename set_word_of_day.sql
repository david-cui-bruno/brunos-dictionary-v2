-- First, let's see what's currently in the word_of_day table
SELECT * FROM public.word_of_day ORDER BY date DESC;

-- Now let's set "shopping period" as today's word of the day
INSERT INTO public.word_of_day (date, word_id, selected_at) 
VALUES (
  CURRENT_DATE, 
  (SELECT id FROM public.words WHERE slug = 'shopping-period'), 
  NOW()
)
ON CONFLICT (date) DO UPDATE SET 
  word_id = EXCLUDED.word_id,
  selected_at = EXCLUDED.selected_at; 