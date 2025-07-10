-- Add more sample words with different scores
INSERT INTO public.words (word, slug, created_by) 
VALUES 
  ('the rock', 'the-rock', '49438b42-9eff-4847-aecf-44ffc4c5e020'),
  ('shopping period', 'shopping-period', '49438b42-9eff-4847-aecf-44ffc4c5e020'),
  ('ratty', 'ratty', '49438b42-9eff-4847-aecf-44ffc4c5e020'),
  ('v-dub', 'v-dub', '49438b42-9eff-4847-aecf-44ffc4c5e020'),
  ('thayer street', 'thayer-street', '49438b42-9eff-4847-aecf-44ffc4c5e020')
ON CONFLICT (slug) DO NOTHING;

-- Get the word IDs
SELECT id, word FROM public.words WHERE slug IN ('the-rock', 'shopping-period', 'ratty', 'v-dub', 'thayer-street');

-- Add definitions with different scores
INSERT INTO public.definitions (word_id, body, example, author_id, score) 
VALUES 
  ((SELECT id FROM public.words WHERE slug = 'the-rock'), 'The Rockefeller Library, the main humanities library on campus', 'I spent all night studying at the rock for my finals.', '49438b42-9eff-4847-aecf-44ffc4c5e020', 5),
  ((SELECT id FROM public.words WHERE slug = 'shopping-period'), 'The first week of classes where students can attend different classes before officially registering', 'I went to 8 different classes during shopping period to find the perfect schedule.', '49438b42-9eff-4847-aecf-44ffc4c5e020', 8),
  ((SELECT id FROM public.words WHERE slug = 'ratty'), 'The Ratty, the main dining hall on campus', 'I grabbed lunch at the ratty before my afternoon classes.', '49438b42-9eff-4847-aecf-44ffc4c5e020', 3),
  ((SELECT id FROM public.words WHERE slug = 'v-dub'), 'The Vartan Gregorian Quad, the main green space on campus', 'We had a picnic on the v-dub during the spring festival.', '49438b42-9eff-4847-aecf-44ffc4c5e020', 7),
  ((SELECT id FROM public.words WHERE slug = 'thayer-street'), 'The main commercial street near campus with restaurants and shops', 'Let''s grab dinner on Thayer Street tonight.', '49438b42-9eff-4847-aecf-44ffc4c5e020', 4)
ON CONFLICT DO NOTHING; 