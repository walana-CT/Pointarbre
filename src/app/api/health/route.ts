import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "L'API est fonctionnelle",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
