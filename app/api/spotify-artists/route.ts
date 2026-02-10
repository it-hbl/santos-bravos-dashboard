import { NextResponse } from "next/server";
import { spotifyTracks, dailyStreams, audienceStats } from "@/app/lib/data";

export async function GET() {
  // TODO: Replace with live Spotify for Artists API calls
  return NextResponse.json({ tracks: spotifyTracks, dailyStreams, audienceStats });
}
