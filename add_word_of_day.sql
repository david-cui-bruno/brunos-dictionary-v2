-- First, let's add a sample word
INSERT INTO public.words (word, slug, created_by) 
VALUES ('shopping period', 'shopping-period', '49438b42-9eff-4847-aecf-44ffc4c5e020')
ON CONFLICT (slug) DO NOTHING;

-- Get the word ID
SELECT id FROM public.words WHERE slug = 'shopping-period';

-- Add a definition
INSERT INTO public.definitions (word_id, body, example, author_id) 
VALUES (
  (SELECT id FROM public.words WHERE slug = 'shopping-period'),
  'The first two weeks of each semester when students can freely attend classes before officially enrolling.',
  'I went to 15 different classes during shopping period to decide which ones to take.',
  '49438b42-9eff-4847-aecf-44ffc4c5e020'
);

-- Add as word of the day for today
INSERT INTO public.word_of_day (date, word_id) 
VALUES (
  CURRENT_DATE,
  (SELECT id FROM public.words WHERE slug = 'shopping-period')
)
ON CONFLICT (date) DO UPDATE SET word_id = EXCLUDED.word_id; 