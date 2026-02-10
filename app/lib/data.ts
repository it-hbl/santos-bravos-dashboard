// Centralized data — swap these functions for live API calls later

export const artistOverview = {
  name: "Santos Bravos",
  tagline: "HYBE Latin Pop Group",
  monthlyListeners: 335584,
  followers: 97592,
  totalStreams: 29700000,
  snsFootprint: 1700000,
};

export const spotifyTracks = [
  { name: "0%", streams: 4818683 },
  { name: "0% PT", streams: 902520 },
  { name: "KAWASAKI", streams: 914305 },
];

export const youtubeVideos = [
  { name: "0% MV", views: 12084773 },
  { name: "0% Visualizer", views: 6224940 },
  { name: "0% PT MV", views: 953545 },
  { name: "KAWASAKI MV", views: 3849420 },
];

export const dailyStreams = [
  { name: "KAWASAKI", streams: 73780 },
  { name: "0%", streams: 30444 },
  { name: "0% PT", streams: 10121 },
];

export const socialMedia = [
  { platform: "TikTok", followers: 652800, color: "#00F2EA" },
  { platform: "YouTube", followers: 471000, color: "#FF0000" },
  { platform: "Instagram", followers: 399500, color: "#E1306C" },
  { platform: "Weverse", followers: 183000, color: "#B8FF01" },
];

export const audioVirality = {
  totalAudioViews: 10400000,
  tracks: [
    { name: "0%", views: 8470000 },
    { name: "0% PT", views: 1930000 },
    { name: "KAWASAKI", views: 0 },
  ],
  tiktokCreates: { track: "0%", lifetime: 7657 },
  instagramCreates: { track: "0%", lifetime: 1781 },
};

export const members = [
  { name: "Kenneth Lavíll", handle: "@soykennethlavill", followers: 685000 },
  { name: "Kauê Penna", handle: "@kauepenna", followers: 250000 },
  { name: "Alejandro Aramburu", handle: "@alearamburu_oficial", followers: 207000 },
  { name: "Drew Venegas", handle: "@and.venn", followers: 179000 },
  { name: "Gabi Bermúdez", handle: "@gabiprpr", followers: 130000 },
];

export const geoCountries = [
  { name: "Mexico", listeners: 136133 },
  { name: "Peru", listeners: 46276 },
  { name: "United States", listeners: 33662 },
  { name: "Brazil", listeners: 26778 },
  { name: "Chile", listeners: 21296 },
];

export const geoCities = [
  { name: "Mexico City", listeners: 36503 },
  { name: "Lima", listeners: 30136 },
  { name: "Santiago", listeners: 13296 },
];

export const audienceStats = {
  period: "28 days",
  listeners: 345077,
  streams: 2114959,
  streamsPerListener: 6.129,
  saves: 120154,
  playlistAdds: 105653,
};
