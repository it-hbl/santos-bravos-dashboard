import {
  artistOverview, spotifyTracks, youtubeVideos, dailyStreams,
  socialMedia, audioVirality, members, geoCountries, geoCities, audienceStats,
} from "./lib/data";
import StreamingCharts from "./components/StreamingCharts";
import SocialChart from "./components/SocialChart";
import GeoChart from "./components/GeoChart";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function StatCard({ label, value, accent, icon }: { label: string; value: string; accent?: string; icon?: string }) {
  return (
    <div className="glass-hybe rounded-2xl p-5 flex flex-col gap-1 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">{label}</span>
      </div>
      <span className={`text-2xl md:text-3xl font-extrabold ${accent || "text-white"}`}>{value}</span>
    </div>
  );
}

export default function Home() {
  const o = artistOverview;
  return (
    <main className="min-h-screen">
      {/* Top Bar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[8px] font-black text-white">H</div>
            <span className="text-xs font-bold tracking-wider text-neutral-400">HYBE LATIN</span>
          </div>
          <span className="text-neutral-700">|</span>
          <span className="text-xs font-semibold text-white tracking-wide">ARTIST INTELLIGENCE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Last Updated: Feb 9, 2026</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero */}
        <section className="hero-bg rounded-3xl p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-violet-500/20">
                SB
              </div>
              <div className="absolute -bottom-2 -right-2 bg-violet-500 text-[9px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider">Active</div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400 font-semibold">HYBE Latin America</p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight sb-gradient">{o.name}</h1>
              <p className="text-neutral-400 text-sm">{o.tagline}</p>
              <div className="flex gap-2 justify-center md:justify-start mt-2">
                <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-neutral-400">🎤 Latin Pop</span>
                <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-neutral-400">5 Members</span>
                <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-neutral-400">3 Releases</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard label="Monthly Listeners" value={fmt(o.monthlyListeners)} accent="text-spotify" icon="🎧" />
            <StatCard label="SP Followers" value={fmt(o.followers)} accent="text-spotify" icon="💚" />
            <StatCard label="Total Streams" value={fmt(o.totalStreams)} icon="📊" />
            <StatCard label="SNS Footprint" value={fmt(o.snsFootprint)} accent="text-tiktok" icon="🌐" />
          </div>
        </section>

        {/* Streaming Performance */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-spotify inline-block" />
              Streaming Performance
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Spotify + YouTube</span>
          </div>
          <StreamingCharts spotifyTracks={spotifyTracks} youtubeVideos={youtubeVideos} dailyStreams={dailyStreams} />
        </section>

        {/* Social Media */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-tiktok inline-block" />
              Social Media Footprint
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">All Platforms</span>
          </div>
          <div className="glass-hybe rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {socialMedia.map((s) => (
                <div key={s.platform} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-2xl font-extrabold" style={{ color: s.color }}>{fmt(s.followers)}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mt-1 font-medium">{s.platform}</p>
                </div>
              ))}
            </div>
            <SocialChart data={socialMedia} />
          </div>
        </section>

        {/* Audio Virality */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-purple-500 inline-block" />
              Audio Virality
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Cobrand · TikTok + Instagram</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-hybe rounded-2xl p-5">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Total Audio Views</p>
              <p className="text-3xl font-extrabold text-white mt-2">{fmt(audioVirality.totalAudioViews)}</p>
              <div className="mt-4 space-y-2">
                {audioVirality.tracks.map((t) => (
                  <div key={t.name} className="flex justify-between text-sm items-center">
                    <span className="text-neutral-400">{t.name}</span>
                    <span className="font-mono text-white font-semibold">{fmt(t.views)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-hybe rounded-2xl p-5">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">TikTok Creates</p>
              <p className="text-3xl font-extrabold text-tiktok mt-2">{audioVirality.tiktokCreates.lifetime.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 mt-2">Lifetime · {audioVirality.tiktokCreates.track}</p>
            </div>
            <div className="glass-hybe rounded-2xl p-5">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Instagram Creates</p>
              <p className="text-3xl font-extrabold text-pink-500 mt-2">{audioVirality.instagramCreates.lifetime.toLocaleString()}</p>
              <p className="text-xs text-neutral-500 mt-2">Lifetime · {audioVirality.instagramCreates.track}</p>
            </div>
          </div>
        </section>

        {/* Band Members */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-pink-500 inline-block" />
              Members
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Instagram Followers</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {members.map((m, i) => {
              const gradients = [
                "from-violet-600 to-blue-500",
                "from-blue-500 to-cyan-400",
                "from-pink-500 to-rose-400",
                "from-amber-500 to-orange-400",
                "from-emerald-500 to-teal-400",
              ];
              return (
                <div key={m.handle} className="glass-hybe rounded-2xl p-5 text-center space-y-3 hover:border-purple-500/30 transition-all duration-300">
                  <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                    {m.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{m.name}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{m.handle}</p>
                  </div>
                  <p className="text-xl font-extrabold text-pink-400">{fmt(m.followers)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Geo Insights */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-blue-500 inline-block" />
              Geo Insights
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Spotify · 28 Days</span>
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
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-amber-500 inline-block" />
              Audience Stats
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{audienceStats.period}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Listeners" value={fmt(audienceStats.listeners)} icon="👥" />
            <StatCard label="Streams" value={fmt(audienceStats.streams)} icon="▶️" />
            <StatCard label="Streams / Listener" value={audienceStats.streamsPerListener.toFixed(2)} icon="🔄" />
            <StatCard label="Saves" value={fmt(audienceStats.saves)} icon="💾" />
            <StatCard label="Playlist Adds" value={fmt(audienceStats.playlistAdds)} icon="📋" />
            <StatCard label="SP Followers" value={fmt(97592)} icon="💚" />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-10 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[7px] font-black text-white">H</div>
            <span className="text-xs font-bold tracking-wider text-neutral-500">HYBE LATIN AMERICA</span>
          </div>
          <p className="text-neutral-600 text-[10px] uppercase tracking-[0.3em]">Artist Intelligence Platform · Data as of February 9, 2026</p>
          <p className="text-neutral-700 text-[10px]">Powered by Chartmetric · YouTube · Spotify for Artists · Cobrand</p>
        </footer>
      </div>
    </main>
  );
}
