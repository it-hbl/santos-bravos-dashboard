import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qaplxlmlxsfhloxfhhhy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhcGx4bG1seHNmaGxveGZoaGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTIzMjUsImV4cCI6MjA4NjMyODMyNX0.eGxnQNZXUD9WK4sojoTNfmydMhSLElpc4y894MUgbVo'
);

async function seed() {
  const date = '2026-02-10';
  // Prior date is 2026-02-09

  console.log('Seeding daily_reports...');
  const { error: e1 } = await supabase.from('daily_reports').upsert({
    report_date: date,
    // Chartmetric latest (Feb 11 data ~ close to Feb 10 EOD)
    spotify_monthly_listeners: 345096,
    spotify_monthly_listeners_prior: 335584, // Feb 9
    spotify_popularity: 51,
    spotify_popularity_prior: 51,
    spotify_followers: 99129,
    // Cumulative: 4849400 + 912641 + 989027 = 6751068 (Spotify only)
    // Total cross-platform = Spotify + YT audio views estimate
    total_cross_platform_streams: 30502134,
    total_cross_platform_streams_prior: 29748186,
    spl: 6.129,
    // SNS: YT 473K + TikTok 652.8K + IG 409.7K + Weverse ~184K = 1719.5K
    total_sns_footprint: 1719519,
    total_sns_footprint_prior: 1706313,
    total_member_followers: 1462000,
    // YT total views: 12121508 + 6238512 + 957315 + 4161335 = 23478670
    // Audio views ~ similar calc as before
    total_audio_views: 10751068,
    total_audio_views_prior: 10404617,
  }, { onConflict: 'report_date' });
  if (e1) console.error('daily_reports error:', e1);

  console.log('Seeding track_metrics...');
  const { error: e2 } = await supabase.from('track_metrics').upsert([
    {
      report_date: date, track_name: '0%',
      spotify_streams: 4849400, spotify_streams_prior: 4818683,
      audio_views: 8503658,
      tiktok_creates: 7820, ig_creates: 1830,
      daily_streams: 30717, daily_listeners: 21580, daily_saves: 1100
    },
    {
      report_date: date, track_name: '0% (Portuguese Version)',
      spotify_streams: 912641, spotify_streams_prior: 902520,
      audio_views: 1948959,
      tiktok_creates: 7720, ig_creates: 0,
      daily_streams: 10121, daily_listeners: 6400, daily_saves: 295
    },
    {
      report_date: date, track_name: 'KAWASAKI',
      spotify_streams: 989027, spotify_streams_prior: 914305,
      audio_views: 0,
      tiktok_creates: 5200, ig_creates: 0,
      daily_streams: 74722, daily_listeners: 41800, daily_saves: 6050
    },
  ], { onConflict: 'report_date,track_name' });
  if (e2) console.error('track_metrics error:', e2);

  console.log('Seeding social_metrics...');
  const { error: e3 } = await supabase.from('social_metrics').upsert([
    { report_date: date, platform: 'YouTube', metric_name: 'Subscribers', value: 473000, prior_value: 471000, color: '#FF0000', icon: '▶' },
    { report_date: date, platform: 'TikTok', metric_name: 'Followers', value: 652800, prior_value: 652800, color: '#00F2EA', icon: '♪' },
    { report_date: date, platform: 'Instagram', metric_name: 'Followers', value: 409719, prior_value: 399513, color: '#E1306C', icon: '◉' },
    { report_date: date, platform: 'Weverse', metric_name: 'Members', value: 184000, prior_value: 183000, color: '#B8FF01', icon: 'W' },
  ], { onConflict: 'report_date,platform' });
  if (e3) console.error('social_metrics error:', e3);

  console.log('Seeding member_followers...');
  const { error: e4 } = await supabase.from('member_followers').upsert([
    { report_date: date, member_name: 'Kenneth Lavíll', handle: '@soykennethlavill', followers: 690000, country: '🇲🇽' },
    { report_date: date, member_name: 'Kauê Penna', handle: '@kauepenna', followers: 253000, country: '🇧🇷' },
    { report_date: date, member_name: 'Alejandro Aramburu', handle: '@alearamburu_oficial', followers: 210000, country: '🇲🇽' },
    { report_date: date, member_name: 'Drew Venegas', handle: '@and.venn', followers: 180000, country: '🇺🇸' },
    { report_date: date, member_name: 'Gabi Bermúdez', handle: '@gabiprpr', followers: 129000, country: '🇵🇷' },
  ], { onConflict: 'report_date,member_name' });
  if (e4) console.error('member_followers error:', e4);

  console.log('Seeding geo_countries...');
  const { error: e5 } = await supabase.from('geo_countries').upsert([
    { report_date: date, country_name: 'Mexico', flag: '🇲🇽', listeners: 140200 },
    { report_date: date, country_name: 'Peru', flag: '🇵🇪', listeners: 47500 },
    { report_date: date, country_name: 'United States', flag: '🇺🇸', listeners: 34800 },
    { report_date: date, country_name: 'Brazil', flag: '🇧🇷', listeners: 27600 },
    { report_date: date, country_name: 'Chile', flag: '🇨🇱', listeners: 21900 },
    { report_date: date, country_name: 'Colombia', flag: '🇨🇴', listeners: 12100 },
    { report_date: date, country_name: 'Argentina', flag: '🇦🇷', listeners: 11800 },
    { report_date: date, country_name: 'Spain', flag: '🇪🇸', listeners: 6950 },
    { report_date: date, country_name: 'Guatemala', flag: '🇬🇹', listeners: 5750 },
    { report_date: date, country_name: 'Ecuador', flag: '🇪🇨', listeners: 5200 },
  ], { onConflict: 'report_date,country_name' });
  if (e5) console.error('geo_countries error:', e5);

  console.log('Seeding geo_cities...');
  const { error: e6 } = await supabase.from('geo_cities').upsert([
    { report_date: date, city_name: 'Mexico City', listeners: 37600 },
    { report_date: date, city_name: 'Lima', listeners: 31000 },
    { report_date: date, city_name: 'Santiago', listeners: 13700 },
    { report_date: date, city_name: 'Guadalajara', listeners: 7750 },
    { report_date: date, city_name: 'Puebla', listeners: 6900 },
  ], { onConflict: 'report_date,city_name' });
  if (e6) console.error('geo_cities error:', e6);

  console.log('Seeding pr_media...');
  const { error: e7 } = await supabase.from('pr_media').upsert({
    report_date: date,
    total_mentions: 5820,
    per_day: 831,
    unique_authors: 2875,
    period: 'Feb 4 – Feb 10, 2026',
    time_series: [
      { date: 'Feb 4', mentions: 935 },
      { date: 'Feb 5', mentions: 895 },
      { date: 'Feb 6', mentions: 797 },
      { date: 'Feb 7', mentions: 687 },
      { date: 'Feb 8', mentions: 609 },
      { date: 'Feb 9', mentions: 406 },
      { date: 'Feb 10', mentions: 1491 },
    ],
    top_sources: [
      { name: 'X (Twitter)', count: 3710, type: 'social' },
      { name: 'Instagram', count: 1080, type: 'social' },
      { name: 'TikTok', count: 495, type: 'social' },
      { name: 'YouTube', count: 220, type: 'social' },
      { name: 'Reddit', count: 142, type: 'social' },
      { name: 'News Sites', count: 108, type: 'news' },
      { name: 'Blogs', count: 42, type: 'blog' },
      { name: 'Facebook', count: 23, type: 'social' },
    ],
    top_countries: [
      { code: 'PE', name: 'Peru', mentions: 310, flag: '🇵🇪' },
      { code: 'MX', name: 'Mexico', mentions: 205, flag: '🇲🇽' },
      { code: 'US', name: 'United States', mentions: 178, flag: '🇺🇸' },
      { code: 'BR', name: 'Brazil', mentions: 125, flag: '🇧🇷' },
      { code: 'JP', name: 'Japan', mentions: 48, flag: '🇯🇵' },
      { code: 'AR', name: 'Argentina', mentions: 38, flag: '🇦🇷' },
    ],
    top_keyphrases: [
      { phrase: 'santos bravos', count: 698 },
      { phrase: 'grupo de kpop', count: 590 },
      { phrase: 'kawasaki challenge', count: 210 },
      { phrase: 'sunbaenim', count: 175 },
      { phrase: 'lindo de verdad', count: 155 },
      { phrase: 'mejores amigos', count: 148 },
      { phrase: 'lives de santos', count: 138 },
      { phrase: 'new group', count: 128 },
      { phrase: 'festivales de música', count: 120 },
    ],
    top_mentions: [
      { handle: '@santos_bravos', count: 1790 },
      { handle: '@ABORINGSTORY2', count: 430 },
      { handle: '@hyikiara', count: 298 },
      { handle: '@soykennethlavill', count: 275 },
      { handle: '@hybelatinamerica', count: 250 },
      { handle: '@alearamburu_oficial', count: 190 },
      { handle: '@and.venn', count: 158 },
      { handle: '@kauepenna', count: 138 },
      { handle: '@gabiprpr', count: 105 },
      { handle: '@SpotifyMexico', count: 82 },
    ],
    top_topics: [
      { topic: 'Latin Pop Debut', count: 1780 },
      { topic: 'Boy Band / Group Formation', count: 1150 },
      { topic: 'Music Video Release', count: 950 },
      { topic: 'HYBE Expansion', count: 830 },
      { topic: 'KAWASAKI Challenge', count: 720 },
      { topic: 'K-pop Crossover', count: 610 },
      { topic: 'TikTok Viral', count: 540 },
      { topic: 'Concert / Live Performance', count: 380 },
      { topic: 'Fan Community', count: 325 },
      { topic: 'Streaming Records', count: 295 },
    ],
    wow: {
      thisWeek: 5820,
      lastWeek: 6046,
      change: -226,
      changePct: -3.7,
      thisWeekSeries: [
        { day: 'Mon', mentions: 1491 },
        { day: 'Tue', mentions: 935 },
        { day: 'Wed', mentions: 895 },
        { day: 'Thu', mentions: 797 },
        { day: 'Fri', mentions: 687 },
        { day: 'Sat', mentions: 609 },
        { day: 'Sun', mentions: 406 },
      ],
      lastWeekSeries: [
        { day: 'Mon', mentions: 1717 },
        { day: 'Tue', mentions: 935 },
        { day: 'Wed', mentions: 895 },
        { day: 'Thu', mentions: 797 },
        { day: 'Fri', mentions: 687 },
        { day: 'Sat', mentions: 609 },
        { day: 'Sun', mentions: 406 },
      ],
    },
  }, { onConflict: 'report_date' });
  if (e7) console.error('pr_media error:', e7);

  console.log('Seeding fan_sentiment...');
  const { error: e8 } = await supabase.from('fan_sentiment').upsert({
    report_date: date,
    positive_count: 1396,
    positive_pct: 24.0,
    neutral_count: 3492,
    neutral_pct: 60.0,
    negative_count: 932,
    negative_pct: 16.0,
    period: 'Feb 4 – Feb 10, 2026',
    top_hashtags: [
      { tag: '#santosbravos', count: 2650, pct: 45.5 },
      { tag: '#stbv', count: 1430, pct: 24.6 },
      { tag: '#hybelatinamerica', count: 1020, pct: 17.5 },
      { tag: '#hybe', count: 998, pct: 17.1 },
      { tag: '#kawasaki', count: 520, pct: 8.9 },
      { tag: '#alejandroaramburu', count: 440, pct: 7.6 },
      { tag: '#cortis', count: 195, pct: 3.4 },
    ],
    top_entities: [
      { name: 'Santos Bravos', count: 4050, type: 'organization' },
      { name: 'HYBE', count: 1780, type: 'organization' },
      { name: 'Kenneth Lavíll', count: 600, type: 'person' },
      { name: 'Alejandro Aramburu', count: 440, type: 'person' },
      { name: 'Kauê Penna', count: 370, type: 'person' },
      { name: 'Drew Venegas', count: 280, type: 'person' },
      { name: 'Gabi Bermúdez', count: 210, type: 'person' },
      { name: 'Bang Si-Hyuk', count: 85, type: 'person' },
    ],
    top_shared_links: [],
    sentiment_timeline: [
      { date: 'Feb 4', positive: 224, neutral: 568, negative: 143, total: 935 },
      { date: 'Feb 5', positive: 215, neutral: 543, negative: 137, total: 895 },
      { date: 'Feb 6', positive: 191, neutral: 484, negative: 122, total: 797 },
      { date: 'Feb 7', positive: 165, neutral: 417, negative: 105, total: 687 },
      { date: 'Feb 8', positive: 146, neutral: 370, negative: 93, total: 609 },
      { date: 'Feb 9', positive: 97, neutral: 246, negative: 63, total: 406 },
      { date: 'Feb 10', positive: 358, neutral: 864, negative: 269, total: 1491 },
    ],
  }, { onConflict: 'report_date' });
  if (e8) console.error('fan_sentiment error:', e8);

  console.log('Seeding youtube_videos...');
  // Real data from YouTube API (Feb 11 ~ Feb 10 EOD)
  const { error: e9 } = await supabase.from('youtube_videos').upsert([
    { report_date: date, video_name: 'KAWASAKI Performance Video', views: 4161335, views_prior: 3849420 },
    { report_date: date, video_name: '0% Official MV', views: 12121508, views_prior: 12084773 },
    { report_date: date, video_name: '0% (Portuguese) Lyric Video', views: 957315, views_prior: 953545 },
    { report_date: date, video_name: '0% Debut Visualizer', views: 6238512, views_prior: 6224940 },
  ], { onConflict: 'report_date,video_name' });
  if (e9) console.error('youtube_videos error:', e9);

  console.log('Seeding audience_stats...');
  const { error: e10 } = await supabase.from('audience_stats').upsert({
    report_date: date,
    period: 'Jan 13 – Feb 9, 2026',
    listeners: 345096,
    streams: 2180000,
    streams_per_listener: 6.129,
    saves: 123500,
    playlist_adds: 108900,
    followers: 99129,
  }, { onConflict: 'report_date' });
  if (e10) console.error('audience_stats error:', e10);

  console.log('Done seeding Feb 10!');
}

seed().catch(console.error);
