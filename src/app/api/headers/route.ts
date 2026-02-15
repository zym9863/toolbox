import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return NextResponse.json({ headers });
}
