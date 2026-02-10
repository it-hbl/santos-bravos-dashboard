import { NextResponse } from "next/server";
import { artistOverview, socialMedia, audioVirality, geoCountries, geoCities } from "@/app/lib/data";

export async function GET() {
  // TODO: Replace with live Chartmetric API calls
  return NextResponse.json({
    overview: artistOverview,
    socialMedia,
    audioVirality,
    geo: { countries: geoCountries, cities: geoCities },
  });
}
