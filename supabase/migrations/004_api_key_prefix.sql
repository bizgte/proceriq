-- Add key_prefix column for display (shows first 10 chars so user can identify their keys)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_prefix text;
