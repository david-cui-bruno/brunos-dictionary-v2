-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE definition_status AS ENUM ('clean', 'flagged', 'removed');
CREATE TYPE flag_reason AS ENUM ('inappropriate', 'spam', 'inaccurate', 'duplicate', 'other');

-- Users table (standalone, no foreign key constraints)
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    netid TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    grad_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Words table
CREATE TABLE public.words (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    word TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigram index for fuzzy search
CREATE INDEX words_slug_trgm_idx ON public.words USING gin (slug gin_trgm_ops);

-- Definitions table
CREATE TABLE public.definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    word_id UUID REFERENCES public.words(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    example TEXT,
    score INTEGER DEFAULT 0,
    author_id UUID REFERENCES public.users(id),
    status definition_status DEFAULT 'clean',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE public.votes (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES public.definitions(id) ON DELETE CASCADE,
    value SMALLINT CHECK (value IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, definition_id)
);

-- Flags table
CREATE TABLE public.flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    definition_id UUID REFERENCES public.definitions(id) ON DELETE CASCADE,
    flagger_id UUID REFERENCES public.users(id),
    reason flag_reason NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search logs table
CREATE TABLE public.search_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    term TEXT NOT NULL,
    searched_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.users(id)
);

-- Word of the day table
CREATE TABLE public.word_of_day (
    date DATE PRIMARY KEY,
    word_id UUID REFERENCES public.words(id),
    selected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON public.words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_definitions_updated_at BEFORE UPDATE ON public.definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 