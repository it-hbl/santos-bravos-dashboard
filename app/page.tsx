import {
  artistOverview, spotifyTracks, youtubeVideos, dailyStreams,
  socialMedia, audioVirality, members, geoCountries, geoCities, audienceStats,
} from "./lib/data";
import StreamingCharts from "./components/StreamingCharts";
import SocialChart from "./components/SocialChart";
import GeoChart from "./components/GeoChart";
import Image from "next/image";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent?: string; sub?: string }) {
  return (
    <div className="glass-hybe rounded-2xl p-5 flex flex-col gap-1 hover:border-purple-500/30 transition-all duration-300 group">
      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">{label}</span>
      <span className={`text-2xl md:text-3xl font-extrabold ${accent || "text-white"} group-hover:scale-105 transition-transform origin-left`}>{value}</span>
      {sub && <span className="text-[10px] text-neutral-600">{sub}</span>}
    </div>
  );
}

function TrackCard({ name, image, streams, views, daily }: { name: string; image?: string; streams: string; views?: string; daily?: string }) {
  return (
    <div className="glass-hybe rounded-2xl p-4 flex gap-4 items-center hover:border-purple-500/30 transition-all duration-300">
      {image && (
        <Image src={image} alt={name} width={64} height={64} className="rounded-lg object-cover w-16 h-16" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white truncate">{name}</p>
        <div className="flex gap-4 mt-1">
          <div>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Streams</p>
            <p className="text-sm font-bold text-spotify">{streams}</p>
          </div>
          {views && (
            <div>
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider">YT Views</p>
              <p className="text-sm font-bold text-ytred">{views}</p>
            </div>
          )}
          {daily && (
            <div>
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider">24h</p>
              <p className="text-sm font-bold text-cyan-400">{daily}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const o = artistOverview;
  return (
    <main className="min-h-screen">
      {/* Top Bar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 100 24" className="h-4 text-white" fill="currentColor">
            <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
          </svg>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.2em]">Latin America</span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.15em]">Artist Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Feb 9, 2026</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            <span className="text-[10px] text-emerald-500 font-medium">LIVE</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-14">
        {/* Hero */}
        <section className="hero-bg rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex-shrink-0">
              <Image 
                src="/sb-avatar.jpg" 
                alt="Santos Bravos" 
                width={140} 
                height={140} 
                className="rounded-2xl shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-500 to-blue-500 text-[8px] font-bold px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider shadow-lg">Active</div>
            </div>
            <div className="text-center md:text-left space-y-3 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <svg viewBox="0 0 60 14" className="h-2.5 text-neutral-500" fill="currentColor">
                  <text x="0" y="12" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="13" letterSpacing="2">HYBE</text>
                </svg>
                <span className="text-[10px] text-neutral-500 font-medium">LATIN AMERICA</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight sb-gradient leading-tight">SANTOS BRAVOS</h1>
              <p className="text-neutral-500 text-sm font-medium">The First Latin Boy Band by HYBE</p>
              <div className="flex gap-2 flex-wrap justify-center md:justify-start mt-3">
                {["🎤 Latin Pop", "👥 5 Members", "💿 3 Releases", "🌎 LATAM + US"].map(tag => (
                  <span key={tag} className="text-[10px] bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 text-neutral-500 hover:border-violet-500/30 transition-colors">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <StatCard label="Monthly Listeners" value={fmt(o.monthlyListeners)} accent="text-spotify" sub="Spotify Global" />
            <StatCard label="Followers" value={fmt(o.followers)} accent="text-spotify" sub="Spotify" />
            <StatCard label="Cross-Platform Streams" value={fmt(o.totalStreams)} sub="All DSPs + YouTube" />
            <StatCard label="SNS Footprint" value={fmt(o.snsFootprint)} accent="text-tiktok" sub="YT + TT + IG + WV" />
          </div>
        </section>

        {/* Track Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-spotify to-emerald-400 inline-block" />
              Releases
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TrackCard name="0%" image="/zero-percent-thumb.jpg" streams={fmt(4818683)} views={fmt(12084773)} daily={fmt(30444)} />
            <TrackCard name="0% (Portuguese)" image="/visualizer-thumb.jpg" streams={fmt(902520)} views={fmt(953545)} daily={fmt(10121)} />
            <TrackCard name="KAWASAKI" image="/kawasaki-thumb.jpg" streams={fmt(914305)} views={fmt(3849420)} daily={fmt(73780)} />
          </div>
        </section>

        {/* Streaming Charts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-spotify to-emerald-400 inline-block" />
              Streaming Breakdown
            </h2>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Spotify + YouTube</span>
          </div>
          <StreamingCharts spotifyTracks={spotifyTracks} youtubeVideos={youtubeVideos} dailyStreams={dailyStreams} />
        </section>

        {/* Social Media */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-tiktok to-cyan-300 inline-block" />
              Social Footprint
            </h2>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{fmt(o.snsFootprint)} Total</span>
          </div>
          <div className="glass-hybe rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {socialMedia.map((s) => (
                <div key={s.platform} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>{fmt(s.followers)}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mt-1.5 font-medium">{s.platform}</p>
                </div>
              ))}
            </div>
            <SocialChart data={socialMedia} />
          </div>
        </section>

        {/* Audio Virality */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500 inline-block" />
              Audio Virality
            </h2>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Cobrand · TT + IG</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-hybe rounded-2xl p-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Total Audio Views</p>
              <p className="text-3xl font-extrabold text-white mt-2">{fmt(audioVirality.totalAudioViews)}</p>
              <div className="mt-4 space-y-3">
                {audioVirality.tracks.map((t) => (
                  <div key={t.name} className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">{t.name}</span>
                    <span className="font-mono text-sm text-white font-semibold">{fmt(t.views)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-hybe rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">TikTok Creates</p>
                <p className="text-3xl font-extrabold text-tiktok mt-2">{audioVirality.tiktokCreates.lifetime.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-neutral-600 mt-4">Lifetime · {audioVirality.tiktokCreates.track}</p>
            </div>
            <div className="glass-hybe rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Instagram Creates</p>
                <p className="text-3xl font-extrabold text-pink-500 mt-2">{audioVirality.instagramCreates.lifetime.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-neutral-600 mt-4">Lifetime · {audioVirality.instagramCreates.track}</p>
            </div>
          </div>
        </section>

        {/* Band Members */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-pink-500 to-rose-400 inline-block" />
              Members
            </h2>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Instagram Followers</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {members.map((m, i) => {
              const gradients = [
                "from-violet-600 to-blue-500",
                "from-cyan-500 to-blue-400",
                "from-pink-500 to-rose-400",
                "from-amber-500 to-orange-400",
                "from-emerald-500 to-teal-400",
              ];
              return (
                <div key={m.handle} className="glass-hybe rounded-2xl p-5 text-center space-y-3 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-base font-bold text-white shadow-lg`}>
                    {m.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{m.name}</p>
                    <p className="text-[10px] text-neutral-600 mt-0.5">{m.handle}</p>
                  </div>
                  <p className="text-lg font-extrabold text-pink-400">{fmt(m.followers)}</p>
                </div>
              );
            })}
          </div>
          <div className="glass-hybe rounded-2xl p-4 flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Total Band Member Followers</span>
            <span className="text-xl font-extrabold text-white">{fmt(members.reduce((a, m) => a + m.followers, 0))}</span>
          </div>
        </section>

        {/* Geo Insights */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-400 inline-block" />
              Geo Insights
            </h2>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Spotify · 28 Days</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-hybe rounded-2xl p-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-4">Top Countries</p>
              <GeoChart data={geoCountries} color="#8B5CF6" />
            </div>
            <div className="glass-hybe rounded-2xl p-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-4">Top Cities</p>
              <GeoChart data={geoCities} color="#06B6D4" />
            </div>
          </div>
        </section>

        {/* Audience Stats */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-400 inline-block" />
              Audience
            </h2>
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{audienceStats.period}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Listeners" value={fmt(audienceStats.listeners)} />
            <StatCard label="Streams" value={fmt(audienceStats.streams)} />
            <StatCard label="Streams / Listener" value={audienceStats.streamsPerListener.toFixed(2)} />
            <StatCard label="Saves" value={fmt(audienceStats.saves)} />
            <StatCard label="Playlist Adds" value={fmt(audienceStats.playlistAdds)} />
            <StatCard label="Followers" value={fmt(97592)} accent="text-spotify" />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-white/[0.03] space-y-3">
          <div className="flex items-center justify-center gap-3">
            <svg viewBox="0 0 60 14" className="h-3 text-neutral-600" fill="currentColor">
              <text x="0" y="12" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="13" letterSpacing="2">HYBE</text>
            </svg>
            <span className="text-neutral-700">·</span>
            <span className="text-[10px] font-medium tracking-[0.15em] text-neutral-600 uppercase">Latin America</span>
          </div>
          <p className="text-neutral-700 text-[10px] uppercase tracking-[0.3em]">Artist Intelligence Platform</p>
          <p className="text-neutral-800 text-[10px]">Data: Chartmetric · Spotify for Artists · YouTube · Cobrand · Weverse</p>
        </footer>
      </div>
    </main>
  );
}
