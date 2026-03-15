CREATE TABLE IF NOT EXISTS telegram_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  telegram_chat_id bigint NOT NULL UNIQUE,
  telegram_username text,
  telegram_first_name text,
  link_token text,         -- one-time token used during linking, null after linked
  linked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS telegram_links_user_idx ON telegram_links(user_id);
CREATE INDEX IF NOT EXISTS telegram_links_chat_idx ON telegram_links(telegram_chat_id);
CREATE INDEX IF NOT EXISTS telegram_links_token_idx ON telegram_links(link_token);
