CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  content text NOT NULL,
  space text NOT NULL DEFAULT 'work' CHECK (space IN ('work', 'personal', 'both')),
  embedding vector(1536),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS thoughts_user_space_idx ON thoughts(user_id, space);
CREATE INDEX IF NOT EXISTS thoughts_embedding_idx ON thoughts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  action text NOT NULL,
  source text DEFAULT 'web',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  label text,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION match_thoughts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id text,
  p_space text DEFAULT 'work'
)
RETURNS TABLE(id uuid, content text, space text, metadata jsonb, similarity float)
LANGUAGE sql STABLE AS $$
  SELECT id, content, space, metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM thoughts
  WHERE user_id = p_user_id
    AND (p_space = 'both' OR space = p_space)
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
