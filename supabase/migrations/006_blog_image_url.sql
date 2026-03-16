-- Add image_url and video_url to blog_posts for visual content
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_url text;
