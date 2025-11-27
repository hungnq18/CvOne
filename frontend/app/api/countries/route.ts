import { NextResponse } from "next/server";
import { getCountries, type ICountry } from "@countrystatecity/countries";

export async function GET() {
    try {
        const countries = await getCountries();
        const sorted = countries.sort((a: ICountry, b: ICountry) =>
            a.name.localeCompare(b.name)
        );
        return NextResponse.json(sorted, { status: 200 });
    } catch (error) {
        console.error("Error in /api/countries:", error);
        return NextResponse.json(
            { message: "Failed to load countries" },
            { status: 500 }
        );
    }
}


