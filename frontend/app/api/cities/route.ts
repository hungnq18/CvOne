import { NextRequest, NextResponse } from "next/server";

// ĐÚNG IMPORT: Dùng City.getCitiesOfCountry (không phải getAllCitiesOfCountry)
import { City } from "country-state-city";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countryIso2 = searchParams.get("country");

  if (!countryIso2) {
    return NextResponse.json(
      { message: "Missing country parameter" },
      { status: 400 }
    );
  }

  try {
    const cities = City.getCitiesOfCountry(countryIso2);

    const cityList = cities || [];

    const sorted = cityList
      .filter((city: any) => !!city.name)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json(sorted);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load cities" },
      { status: 500 }
    );
  }
}
