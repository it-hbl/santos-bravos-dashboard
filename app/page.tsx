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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest text-neutral-500">{label}</span>
      <span className={`text-2xl md:text-3xl font-bold ${accent || "text-white"}`}>{value}</span>
    </div>
  );
}

export default function Home() {
  const o = artistOverview;
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-spotify to-tiktok flex items-center justify-center text-4xl font-black text-black">SB</div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">{o.name}</h1>
        <p className="text-neutral-400 text-sm uppercase tracking-widest">{o.tagline}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="Monthly Listeners" value={fmt(o.monthlyListeners)} accent="text-spotify" />
          <StatCard label="SP Followers" value={fmt(o.followers)} accent="text-spotify" />
          <StatCard label="Total Streams" value={fmt(o.totalStreams)} />
          <StatCard label="SNS Footprint" value={fmt(o.snsFootprint)} accent="text-tiktok" />
        </div>
      </section>

      {/* Streaming Performance */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-spotify inline-block" /> Streaming Performance
        </h2>
        <StreamingCharts spotifyTracks={spotifyTracks} youtubeVideos={youtubeVideos} dailyStreams={dailyStreams} />
      </section>

      {/* Social Media */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tiktok inline-block" /> Social Media
        </h2>
        <div className="glass rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {socialMedia.map((s) => (
              <div key={s.platform} className="text-center">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{fmt(s.followers)}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">{s.platform}</p>
              </div>
            ))}
          </div>
          <SocialChart data={socialMedia} />
        </div>
      </section>

      {/* Audio Virality */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Audio Virality (Cobrand)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Total Audio Views</p>
            <p className="text-3xl font-bold text-white mt-1">{fmt(audioVirality.totalAudioViews)}</p>
            <div className="mt-3 space-y-1">
              {audioVirality.tracks.map((t) => (
                <div key={t.name} className="flex justify-between text-sm">
                  <span className="text-neutral-400">{t.name}</span>
                  <span className="font-mono">{fmt(t.views)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">TikTok Creates</p>
            <p className="text-3xl font-bold text-tiktok mt-1">{audioVirality.tiktokCreates.lifetime.toLocaleString()}</p>
            <p className="text-sm text-neutral-400 mt-1">Track: {audioVirality.tiktokCreates.track} (lifetime)</p>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Instagram Creates</p>
            <p className="text-3xl font-bold text-pink-500 mt-1">{audioVirality.instagramCreates.lifetime.toLocaleString()}</p>
            <p className="text-sm text-neutral-400 mt-1">Track: {audioVirality.instagramCreates.track} (lifetime)</p>
          </div>
        </div>
      </section>

      {/* Band Members */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" /> Members
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {members.map((m) => (
            <div key={m.handle} className="glass rounded-xl p-5 text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                {m.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <p className="font-semibold text-sm">{m.name}</p>
              <p className="text-xs text-neutral-500">{m.handle}</p>
              <p className="text-lg font-bold text-pink-400">{fmt(m.followers)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Geo Insights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Geo Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Top Countries</p>
            <GeoChart data={geoCountries} color="#3B82F6" />
          </div>
          <div className="glass rounded-xl p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Top Cities</p>
            <GeoChart data={geoCities} color="#8B5CF6" />
          </div>
        </div>
      </section>

      {/* Audience Stats */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Audience Stats
          <span className="text-xs text-neutral-500 font-normal ml-2">({audienceStats.period})</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Listeners" value={fmt(audienceStats.listeners)} />
          <StatCard label="Streams" value={fmt(audienceStats.streams)} />
          <StatCard label="Streams/Listener" value={audienceStats.streamsPerListener.toFixed(2)} />
          <StatCard label="Saves" value={fmt(audienceStats.saves)} />
          <StatCard label="Playlist Adds" value={fmt(audienceStats.playlistAdds)} />
          <StatCard label="SPL" value={audienceStats.streamsPerListener.toFixed(3)} />
        </div>
      </section>

      <footer className="text-center text-neutral-600 text-xs py-8 border-t border-border">
        Santos Bravos Analytics Dashboard · Data as of Feb 2026 · HYBE × Warner Music
      </footer>
    </main>
  );
}
