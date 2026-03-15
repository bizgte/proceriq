CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,  -- 'pdf', 'txt', 'docx', 'md'
  size_bytes integer,
  chunk_count integer DEFAULT 0,
  storage_path text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_user_idx ON documents(user_id);
