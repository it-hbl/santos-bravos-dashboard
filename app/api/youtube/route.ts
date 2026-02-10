import { NextResponse } from "next/server";
import { youtubeVideos } from "@/app/lib/data";

export async function GET() {
  // TODO: Replace with live YouTube Data API calls
  return NextResponse.json({ videos: youtubeVideos });
}
