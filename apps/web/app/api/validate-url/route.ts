import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  try {
    const res = await fetch(`${url}`);
    return NextResponse.json({ isOk: res.ok }); // returns true for 2xx responses
  } catch (err) {
    return NextResponse.json({ isOk: false });
  }
}
