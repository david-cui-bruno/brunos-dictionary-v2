-- Add username and concentration fields to users table
ALTER TABLE public.users 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN concentration TEXT;

-- Add a check constraint for grad_year to be reasonable
ALTER TABLE public.users 
ADD CONSTRAINT grad_year_check CHECK (grad_year >= 1900 AND grad_year <= 2100); 