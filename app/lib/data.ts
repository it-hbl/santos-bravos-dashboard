// Centralized data — swap these for live API calls later
// All data as of Feb 9, 2026. Prior day = Feb 4, 2026 (last report)

export const reportDate = "February 9, 2026";
export const priorDate = "February 4, 2026";

// === SECTION 1: Business Performance Snapshot ===
export const businessPerformance = {
  spotifyMonthlyListeners: { current: 335584, prior: 325961, label: "Spotify Monthly Listeners (Global)" },
  spotifyPopularity: { current: 51, prior: null, label: "Spotify Popularity Index" },
  spotifyFollowers: { current: 97592, prior: null, label: "Spotify Followers" },
  tracks: [
    { name: "0%", spotifyStreams: { current: 4818683, prior: 4712736 } },
    { name: "0% (Portuguese Version)", spotifyStreams: { current: 902520, prior: 868325 } },
    { name: "KAWASAKI", spotifyStreams: { current: 914305, prior: 648672 } },
  ],
  totalCrossPlatformStreams: { current: 29748186, prior: null, label: "Total Cross-Platform Streams (All DSPs + YouTube)" },
  youtubeVideos: [
    { name: "KAWASAKI Performance Video", views: { current: 3849420, prior: 2158030 } },
    { name: "0% Official MV", views: { current: 12084773, prior: 11975502 } },
    { name: "0% (Portuguese) Lyric Video", views: { current: 953545, prior: 941246 } },
    { name: "0% Debut Visualizer", views: { current: 6224940, prior: 6181833 } },
  ],
  spl: { current: 6.129, label: "Streams Per Listener (SPL) — 28 Days" },
};

// Daily streams from Spotify for Artists (Feb 8, 24h)
export const dailyStreams = [
  { name: "KAWASAKI", streams: 73780, listeners: 41053, saves: 5906 },
  { name: "0%", streams: 30444, listeners: 21361, saves: 1084 },
  { name: "0% (Portuguese)", streams: 10121, listeners: 6363, saves: 288 },
];

// === SECTION 2: Social Media Performance (SNS) ===
export const socialMedia = {
  totalFootprint: { current: 1706313, prior: 1663235, label: "Total SNS Footprint (IG + TT + YT + WV)" },
  platforms: [
    { platform: "YouTube", metric: "Subscribers", current: 471000, prior: 459235, color: "#FF0000", icon: "▶" },
    { platform: "TikTok", metric: "Followers", current: 652800, prior: 639100, color: "#00F2EA", icon: "♪" },
    { platform: "Instagram", metric: "Followers", current: 399513, prior: 386935, color: "#E1306C", icon: "◉" },
    { platform: "Weverse", metric: "Members", current: 183000, prior: 177965, color: "#B8FF01", icon: "W" },
  ],
};

// === SECTION 3: Audio Virality (TT + IG Audio Tracker) ===
export const audioVirality = {
  totalAudioViews: { current: 10404617, prior: 10263380, label: "Total Audio Views (TT + IG)" },
  tracks: [
    { name: "0%", views: 8469658, tiktokCreates: 7657, igCreates: 1781 },
    { name: "0% (Portuguese)", views: 1934959, tiktokCreates: 7657, igCreates: 0 },
    { name: "KAWASAKI", views: 0, tiktokCreates: 4903, igCreates: 0 },
  ],
};

// === SECTION 4: Band Member Followers ===
export const members = [
  { name: "Kenneth Lavíll", handle: "@soykennethlavill", followers: 685000, country: "🇲🇽" },
  { name: "Kauê Penna", handle: "@kauepenna", followers: 250000, country: "🇧🇷" },
  { name: "Alejandro Aramburu", handle: "@alearamburu_oficial", followers: 207000, country: "🇲🇽" },
  { name: "Drew Venegas", handle: "@and.venn", followers: 179000, country: "🇺🇸" },
  { name: "Gabi Bermúdez", handle: "@gabiprpr", followers: 130000, country: "🇵🇷" },
];
export const totalMemberFollowers = { current: 1451000, prior: null };

// === SECTION 5: Geo Signals ===
export const geoCountries = [
  { name: "Mexico", listeners: 136133, flag: "🇲🇽" },
  { name: "Peru", listeners: 46276, flag: "🇵🇪" },
  { name: "United States", listeners: 33662, flag: "🇺🇸" },
  { name: "Brazil", listeners: 26778, flag: "🇧🇷" },
  { name: "Chile", listeners: 21296, flag: "🇨🇱" },
  { name: "Colombia", listeners: 11763, flag: "🇨🇴" },
  { name: "Argentina", listeners: 11527, flag: "🇦🇷" },
  { name: "Spain", listeners: 6728, flag: "🇪🇸" },
  { name: "Guatemala", listeners: 5584, flag: "🇬🇹" },
  { name: "Ecuador", listeners: 5039, flag: "🇪🇨" },
];

export const geoCities = [
  { name: "Mexico City", listeners: 36503 },
  { name: "Lima", listeners: 30136 },
  { name: "Santiago", listeners: 13296 },
  { name: "Guadalajara", listeners: 7529 },
  { name: "Puebla", listeners: 6711 },
];

// === SECTION 6: PR & Media Exposure (Meltwater) ===
export const prMedia = {
  period: "Feb 3 – Feb 9, 2026",
  totalMentions: 6046,
  perDay: 863,
  uniqueAuthors: 2991,
  timeSeries: [
    { date: "Feb 3", mentions: 1717 },
    { date: "Feb 4", mentions: 935 },
    { date: "Feb 5", mentions: 895 },
    { date: "Feb 6", mentions: 797 },
    { date: "Feb 7", mentions: 687 },
    { date: "Feb 8", mentions: 609 },
    { date: "Feb 9", mentions: 406 },
  ],
  topCountries: [
    { code: "PE", name: "Peru", mentions: 329, flag: "🇵🇪" },
    { code: "MX", name: "Mexico", mentions: 185, flag: "🇲🇽" },
    { code: "US", name: "United States", mentions: 169, flag: "🇺🇸" },
    { code: "BR", name: "Brazil", mentions: 112, flag: "🇧🇷" },
    { code: "JP", name: "Japan", mentions: 55, flag: "🇯🇵" },
    { code: "AR", name: "Argentina", mentions: 33, flag: "🇦🇷" },
  ],
  topKeyphrases: [
    { phrase: "santos bravos", count: 673 },
    { phrase: "grupo de kpop", count: 613 },
    { phrase: "sunbaenim", count: 183 },
    { phrase: "lindo de verdad", count: 161 },
    { phrase: "mejores amigos", count: 143 },
    { phrase: "lives de santos", count: 142 },
    { phrase: "new group", count: 132 },
    { phrase: "festivales de música", count: 125 },
    { phrase: "nuevo video", count: 125 },
  ],
  topSources: [
    { name: "X (Twitter)", count: 3842, type: "social" },
    { name: "Instagram", count: 1105, type: "social" },
    { name: "TikTok", count: 487, type: "social" },
    { name: "YouTube", count: 234, type: "social" },
    { name: "Reddit", count: 156, type: "social" },
    { name: "News Sites", count: 122, type: "news" },
    { name: "Blogs", count: 67, type: "blog" },
    { name: "Facebook", count: 33, type: "social" },
  ],
};

// === SECTION 7: Fan Sentiment (Meltwater) ===
export const fanSentiment = {
  period: "Feb 3 – Feb 9, 2026",
  positive: { count: 1441, pct: 23.8 },
  negative: { count: 935, pct: 15.5 },
  neutral: { count: 3669, pct: 60.7 },
  topHashtags: [
    { tag: "#santosbravos", count: 2732, pct: 45.9 },
    { tag: "#stbv", count: 1477, pct: 24.8 },
    { tag: "#hybelatinamerica", count: 1056, pct: 17.7 },
    { tag: "#hybe", count: 1033, pct: 17.3 },
    { tag: "#alejandroaramburu", count: 453, pct: 7.6 },
    { tag: "#kawasaki", count: 248, pct: 4.2 },
    { tag: "#cortis", count: 200, pct: 3.4 },
  ],
};

// === Audience Stats (Spotify for Artists, 28 days) ===
export const audienceStats = {
  period: "Jan 12 – Feb 8, 2026",
  listeners: 345077,
  streams: 2114959,
  streamsPerListener: 6.129,
  saves: 120154,
  playlistAdds: 105653,
  followers: 97592,
};

// Legacy exports for chart components
export const artistOverview = {
  name: "Santos Bravos",
  tagline: "The First Latin Boy Band by HYBE",
  monthlyListeners: 335584,
  followers: 97592,
  totalStreams: 29748186,
  snsFootprint: 1706313,
};

export const spotifyTracks = businessPerformance.tracks.map(t => ({
  name: t.name, streams: t.spotifyStreams.current
}));

export const youtubeVideos = businessPerformance.youtubeVideos.map(v => ({
  name: v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, ""),
  views: v.views.current
}));
