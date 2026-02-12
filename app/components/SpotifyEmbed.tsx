"use client";

import { useState } from "react";

interface Track {
  name: string;
  spotifyId: string;
}

const TRACKS: Track[] = [
  { name: "0%", spotifyId: "0V91BVy8lD7xoxQBNajPiu" },
  { name: "0% (Portuguese)", spotifyId: "4WwOkpl2MxLCeIfDOFjziN" },
  { name: "KAWASAKI", spotifyId: "1ojKC4x3rDKoaikvEx1Lt2" },
];

export default function SpotifyEmbed() {
  const [activeTrack, setActiveTrack] = useState<string>(TRACKS[0].spotifyId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎧</span>
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium">Listen Now</p>
      </div>

      {/* Track selector pills */}
      <div className="flex gap-2 flex-wrap">
        {TRACKS.map((t) => (
          <button
            key={t.spotifyId}
            onClick={() => setActiveTrack(t.spotifyId)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
              activeTrack === t.spotifyId
                ? "bg-spotify text-black"
                : "bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Spotify embed iframe */}
      <div className="rounded-xl overflow-hidden">
        <iframe
          key={activeTrack}
          src={`https://open.spotify.com/embed/track/${activeTrack}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="border-0 rounded-xl"
          title="Spotify Player"
        />
      </div>
    </div>
  );
}
