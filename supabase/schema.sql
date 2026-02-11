-- Santos Bravos Dashboard Schema

CREATE TABLE IF NOT EXISTS daily_reports (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  spotify_monthly_listeners INTEGER,
  spotify_monthly_listeners_prior INTEGER,
  spotify_popularity INTEGER,
  spotify_popularity_prior INTEGER,
  spotify_followers INTEGER,
  total_cross_platform_streams BIGINT,
  total_cross_platform_streams_prior BIGINT,
  spl NUMERIC(6,3),
  total_sns_footprint INTEGER,
  total_sns_footprint_prior INTEGER,
  total_member_followers INTEGER,
  total_audio_views BIGINT,
  total_audio_views_prior BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS track_metrics (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  track_name TEXT NOT NULL,
  spotify_streams BIGINT,
  spotify_streams_prior BIGINT,
  audio_views BIGINT DEFAULT 0,
  tiktok_creates INTEGER DEFAULT 0,
  ig_creates INTEGER DEFAULT 0,
  daily_streams INTEGER DEFAULT 0,
  daily_listeners INTEGER DEFAULT 0,
  daily_saves INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_date, track_name)
);

CREATE TABLE IF NOT EXISTS social_metrics (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  platform TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value INTEGER NOT NULL,
  prior_value INTEGER,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_date, platform)
);

CREATE TABLE IF NOT EXISTS member_followers (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  member_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  followers INTEGER NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_date, member_name)
);

CREATE TABLE IF NOT EXISTS geo_countries (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  country_name TEXT NOT NULL,
  flag TEXT,
  listeners INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_date, country_name)
);

CREATE TABLE IF NOT EXISTS geo_cities (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  city_name TEXT NOT NULL,
  listeners INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_date, city_name)
);

CREATE TABLE IF NOT EXISTS pr_media (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  total_mentions INTEGER,
  per_day INTEGER,
  unique_authors INTEGER,
  period TEXT,
  time_series JSONB,
  top_sources JSONB,
  top_countries JSONB,
  top_keyphrases JSONB,
  top_mentions JSONB,
  top_topics JSONB,
  wow JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fan_sentiment (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  positive_count INTEGER,
  positive_pct NUMERIC(5,1),
  neutral_count INTEGER,
  neutral_pct NUMERIC(5,1),
  negative_count INTEGER,
  negative_pct NUMERIC(5,1),
  period TEXT,
  top_hashtags JSONB,
  top_entities JSONB,
  top_shared_links JSONB,
  sentiment_timeline JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_videos (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  video_name TEXT NOT NULL,
  views BIGINT,
  views_prior BIGINT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_date, video_name)
);

CREATE TABLE IF NOT EXISTS audience_stats (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  period TEXT,
  listeners INTEGER,
  streams INTEGER,
  streams_per_listener NUMERIC(6,3),
  saves INTEGER,
  playlist_adds INTEGER,
  followers INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow anon read access
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON track_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON social_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON member_followers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON geo_countries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON geo_cities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON pr_media FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON fan_sentiment FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON youtube_videos FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON audience_stats FOR SELECT USING (true);

-- Allow anon insert/update for seeding (can restrict later)
CREATE POLICY "Allow anon insert" ON daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON track_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON social_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON member_followers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON geo_countries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON geo_cities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON pr_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON fan_sentiment FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON youtube_videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON audience_stats FOR INSERT WITH CHECK (true);
