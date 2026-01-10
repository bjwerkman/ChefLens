-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    source_url TEXT,
    image_url TEXT,
    raw_content TEXT,
    parsed_data JSONB,
    cookidoo_id TEXT
);

-- user_tokens table
CREATE TABLE IF NOT EXISTS user_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cookidoo_refresh_token TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own tokens" ON user_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON user_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON user_tokens
    FOR UPDATE USING (auth.uid() = user_id);
