import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.sefari.io/int/v1/fleet-ops/lookup";

export async function GET(request: NextRequest) {
  const tracking = request.nextUrl.searchParams.get("tracking");

  if (!tracking) {
    return NextResponse.json(
      { error: "Missing tracking parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}?tracking=${encodeURIComponent(tracking)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to lookup order" },
      { status: 500 }
    );
  }
}
