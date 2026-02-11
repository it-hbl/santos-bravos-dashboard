import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qaplxlmlxsfhloxfhhhy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhcGx4bG1seHNmaGxveGZoaGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTIzMjUsImV4cCI6MjA4NjMyODMyNX0.eGxnQNZXUD9WK4sojoTNfmydMhSLElpc4y894MUgbVo'
);

async function seed() {
  const date = '2026-02-09';

  console.log('Seeding daily_reports...');
  const { error: e1 } = await supabase.from('daily_reports').upsert({
    report_date: date,
    spotify_monthly_listeners: 335584,
    spotify_monthly_listeners_prior: 325961,
    spotify_popularity: 51,
    spotify_popularity_prior: null,
    spotify_followers: 97592,
    total_cross_platform_streams: 29748186,
    total_cross_platform_streams_prior: null,
    spl: 6.129,
    total_sns_footprint: 1706313,
    total_sns_footprint_prior: 1663235,
    total_member_followers: 1451000,
    total_audio_views: 10404617,
    total_audio_views_prior: 10263380,
  }, { onConflict: 'report_date' });
  if (e1) console.error('daily_reports error:', e1);

  console.log('Seeding track_metrics...');
  const { error: e2 } = await supabase.from('track_metrics').upsert([
    { report_date: date, track_name: '0%', spotify_streams: 4818683, spotify_streams_prior: 4712736, audio_views: 8469658, tiktok_creates: 7657, ig_creates: 1781, daily_streams: 30444, daily_listeners: 21361, daily_saves: 1084 },
    { report_date: date, track_name: '0% (Portuguese Version)', spotify_streams: 902520, spotify_streams_prior: 868325, audio_views: 1934959, tiktok_creates: 7657, ig_creates: 0, daily_streams: 10121, daily_listeners: 6363, daily_saves: 288 },
    { report_date: date, track_name: 'KAWASAKI', spotify_streams: 914305, spotify_streams_prior: 648672, audio_views: 0, tiktok_creates: 4903, ig_creates: 0, daily_streams: 73780, daily_listeners: 41053, daily_saves: 5906 },
  ], { onConflict: 'report_date,track_name' });
  if (e2) console.error('track_metrics error:', e2);

  console.log('Seeding social_metrics...');
  const { error: e3 } = await supabase.from('social_metrics').upsert([
    { report_date: date, platform: 'YouTube', metric_name: 'Subscribers', value: 471000, prior_value: 459235, color: '#FF0000', icon: '▶' },
    { report_date: date, platform: 'TikTok', metric_name: 'Followers', value: 652800, prior_value: 639100, color: '#00F2EA', icon: '♪' },
    { report_date: date, platform: 'Instagram', metric_name: 'Followers', value: 399513, prior_value: 386935, color: '#E1306C', icon: '◉' },
    { report_date: date, platform: 'Weverse', metric_name: 'Members', value: 183000, prior_value: 177965, color: '#B8FF01', icon: 'W' },
  ], { onConflict: 'report_date,platform' });
  if (e3) console.error('social_metrics error:', e3);

  console.log('Seeding member_followers...');
  const { error: e4 } = await supabase.from('member_followers').upsert([
    { report_date: date, member_name: 'Kenneth Lavíll', handle: '@soykennethlavill', followers: 685000, country: '🇲🇽' },
    { report_date: date, member_name: 'Kauê Penna', handle: '@kauepenna', followers: 250000, country: '🇧🇷' },
    { report_date: date, member_name: 'Alejandro Aramburu', handle: '@alearamburu_oficial', followers: 207000, country: '🇲🇽' },
    { report_date: date, member_name: 'Drew Venegas', handle: '@and.venn', followers: 179000, country: '🇺🇸' },
    { report_date: date, member_name: 'Gabi Bermúdez', handle: '@gabiprpr', followers: 130000, country: '🇵🇷' },
  ], { onConflict: 'report_date,member_name' });
  if (e4) console.error('member_followers error:', e4);

  console.log('Seeding geo_countries...');
  const { error: e5 } = await supabase.from('geo_countries').upsert([
    { report_date: date, country_name: 'Mexico', flag: '🇲🇽', listeners: 136133 },
    { report_date: date, country_name: 'Peru', flag: '🇵🇪', listeners: 46276 },
    { report_date: date, country_name: 'United States', flag: '🇺🇸', listeners: 33662 },
    { report_date: date, country_name: 'Brazil', flag: '🇧🇷', listeners: 26778 },
    { report_date: date, country_name: 'Chile', flag: '🇨🇱', listeners: 21296 },
    { report_date: date, country_name: 'Colombia', flag: '🇨🇴', listeners: 11763 },
    { report_date: date, country_name: 'Argentina', flag: '🇦🇷', listeners: 11527 },
    { report_date: date, country_name: 'Spain', flag: '🇪🇸', listeners: 6728 },
    { report_date: date, country_name: 'Guatemala', flag: '🇬🇹', listeners: 5584 },
    { report_date: date, country_name: 'Ecuador', flag: '🇪🇨', listeners: 5039 },
  ], { onConflict: 'report_date,country_name' });
  if (e5) console.error('geo_countries error:', e5);

  console.log('Seeding geo_cities...');
  const { error: e6 } = await supabase.from('geo_cities').upsert([
    { report_date: date, city_name: 'Mexico City', listeners: 36503 },
    { report_date: date, city_name: 'Lima', listeners: 30136 },
    { report_date: date, city_name: 'Santiago', listeners: 13296 },
    { report_date: date, city_name: 'Guadalajara', listeners: 7529 },
    { report_date: date, city_name: 'Puebla', listeners: 6711 },
  ], { onConflict: 'report_date,city_name' });
  if (e6) console.error('geo_cities error:', e6);

  console.log('Seeding pr_media...');
  const { error: e7 } = await supabase.from('pr_media').upsert({
    report_date: date,
    total_mentions: 6046,
    per_day: 863,
    unique_authors: 2991,
    period: 'Feb 3 – Feb 9, 2026',
    time_series: [
      { date: 'Feb 3', mentions: 1717 },
      { date: 'Feb 4', mentions: 935 },
      { date: 'Feb 5', mentions: 895 },
      { date: 'Feb 6', mentions: 797 },
      { date: 'Feb 7', mentions: 687 },
      { date: 'Feb 8', mentions: 609 },
      { date: 'Feb 9', mentions: 406 },
    ],
    top_sources: [
      { name: 'X (Twitter)', count: 3842, type: 'social' },
      { name: 'Instagram', count: 1105, type: 'social' },
      { name: 'TikTok', count: 487, type: 'social' },
      { name: 'YouTube', count: 234, type: 'social' },
      { name: 'Reddit', count: 156, type: 'social' },
      { name: 'News Sites', count: 122, type: 'news' },
      { name: 'Blogs', count: 67, type: 'blog' },
      { name: 'Facebook', count: 33, type: 'social' },
    ],
    top_countries: [
      { code: 'PE', name: 'Peru', mentions: 329, flag: '🇵🇪' },
      { code: 'MX', name: 'Mexico', mentions: 185, flag: '🇲🇽' },
      { code: 'US', name: 'United States', mentions: 169, flag: '🇺🇸' },
      { code: 'BR', name: 'Brazil', mentions: 112, flag: '🇧🇷' },
      { code: 'JP', name: 'Japan', mentions: 55, flag: '🇯🇵' },
      { code: 'AR', name: 'Argentina', mentions: 33, flag: '🇦🇷' },
    ],
    top_keyphrases: [
      { phrase: 'santos bravos', count: 673 },
      { phrase: 'grupo de kpop', count: 613 },
      { phrase: 'sunbaenim', count: 183 },
      { phrase: 'lindo de verdad', count: 161 },
      { phrase: 'mejores amigos', count: 143 },
      { phrase: 'lives de santos', count: 142 },
      { phrase: 'new group', count: 132 },
      { phrase: 'festivales de música', count: 125 },
      { phrase: 'nuevo video', count: 125 },
    ],
    top_mentions: [
      { handle: '@santos_bravos', count: 1842 },
      { handle: '@ABORINGSTORY2', count: 456 },
      { handle: '@hyikiara', count: 312 },
      { handle: '@soykennethlavill', count: 287 },
      { handle: '@hybelatinamerica', count: 264 },
      { handle: '@alearamburu_oficial', count: 198 },
      { handle: '@and.venn', count: 167 },
      { handle: '@kauepenna', count: 143 },
      { handle: '@gabiprpr', count: 112 },
      { handle: '@SpotifyMexico', count: 89 },
    ],
    top_topics: [
      { topic: 'Latin Pop Debut', count: 1842 },
      { topic: 'Boy Band / Group Formation', count: 1203 },
      { topic: 'Music Video Release', count: 987 },
      { topic: 'HYBE Expansion', count: 856 },
      { topic: 'K-pop Crossover', count: 643 },
      { topic: 'TikTok Viral', count: 521 },
      { topic: 'Concert / Live Performance', count: 398 },
      { topic: 'Fan Community', count: 312 },
      { topic: 'Streaming Records', count: 287 },
      { topic: 'Cultural Representation', count: 234 },
    ],
    wow: {
      thisWeek: 6046,
      lastWeek: 7823,
      change: -1777,
      changePct: -22.7,
      thisWeekSeries: [
        { day: 'Mon', mentions: 1717 },
        { day: 'Tue', mentions: 935 },
        { day: 'Wed', mentions: 895 },
        { day: 'Thu', mentions: 797 },
        { day: 'Fri', mentions: 687 },
        { day: 'Sat', mentions: 609 },
        { day: 'Sun', mentions: 406 },
      ],
      lastWeekSeries: [
        { day: 'Mon', mentions: 2134 },
        { day: 'Tue', mentions: 1456 },
        { day: 'Wed', mentions: 1203 },
        { day: 'Thu', mentions: 1087 },
        { day: 'Fri', mentions: 892 },
        { day: 'Sat', mentions: 643 },
        { day: 'Sun', mentions: 408 },
      ],
    },
  }, { onConflict: 'report_date' });
  if (e7) console.error('pr_media error:', e7);

  console.log('Seeding fan_sentiment...');
  const { error: e8 } = await supabase.from('fan_sentiment').upsert({
    report_date: date,
    positive_count: 1441,
    positive_pct: 23.8,
    neutral_count: 3669,
    neutral_pct: 60.7,
    negative_count: 935,
    negative_pct: 15.5,
    period: 'Feb 3 – Feb 9, 2026',
    top_hashtags: [
      { tag: '#santosbravos', count: 2732, pct: 45.9 },
      { tag: '#stbv', count: 1477, pct: 24.8 },
      { tag: '#hybelatinamerica', count: 1056, pct: 17.7 },
      { tag: '#hybe', count: 1033, pct: 17.3 },
      { tag: '#alejandroaramburu', count: 453, pct: 7.6 },
      { tag: '#kawasaki', count: 248, pct: 4.2 },
      { tag: '#cortis', count: 200, pct: 3.4 },
    ],
    top_entities: [
      { name: 'Santos Bravos', count: 4200, type: 'organization' },
      { name: 'HYBE', count: 1850, type: 'organization' },
      { name: 'Kenneth Lavíll', count: 620, type: 'person' },
      { name: 'Alejandro Aramburu', count: 453, type: 'person' },
      { name: 'Kauê Penna', count: 380, type: 'person' },
      { name: 'Drew Venegas', count: 290, type: 'person' },
      { name: 'Gabi Bermúdez', count: 215, type: 'person' },
      { name: 'Bang Si-Hyuk', count: 89, type: 'person' },
    ],
    top_shared_links: [],
    sentiment_timeline: [
      { date: 'Feb 3', positive: 409, neutral: 1042, negative: 266, total: 1717 },
      { date: 'Feb 4', positive: 223, neutral: 568, negative: 145, total: 935 },
      { date: 'Feb 5', positive: 213, neutral: 543, negative: 139, total: 895 },
      { date: 'Feb 6', positive: 190, neutral: 484, negative: 124, total: 797 },
      { date: 'Feb 7', positive: 164, neutral: 417, negative: 107, total: 687 },
      { date: 'Feb 8', positive: 145, neutral: 370, negative: 94, total: 609 },
      { date: 'Feb 9', positive: 97, neutral: 246, negative: 63, total: 406 },
    ],
  }, { onConflict: 'report_date' });
  if (e8) console.error('fan_sentiment error:', e8);

  console.log('Seeding youtube_videos...');
  const { error: e9 } = await supabase.from('youtube_videos').upsert([
    { report_date: date, video_name: 'KAWASAKI Performance Video', views: 3849420, views_prior: 2158030 },
    { report_date: date, video_name: '0% Official MV', views: 12084773, views_prior: 11975502 },
    { report_date: date, video_name: '0% (Portuguese) Lyric Video', views: 953545, views_prior: 941246 },
    { report_date: date, video_name: '0% Debut Visualizer', views: 6224940, views_prior: 6181833 },
  ], { onConflict: 'report_date,video_name' });
  if (e9) console.error('youtube_videos error:', e9);

  console.log('Seeding audience_stats...');
  const { error: e10 } = await supabase.from('audience_stats').upsert({
    report_date: date,
    period: 'Jan 12 – Feb 8, 2026',
    listeners: 345077,
    streams: 2114959,
    streams_per_listener: 6.129,
    saves: 120154,
    playlist_adds: 105653,
    followers: 97592,
  }, { onConflict: 'report_date' });
  if (e10) console.error('audience_stats error:', e10);

  console.log('Done seeding!');
}

seed().catch(console.error);
