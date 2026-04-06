import { NextResponse } from "next/server"
import { getAvailableDates } from "@/lib/history"

export async function GET() {
  const dates = getAvailableDates()
  return NextResponse.json({
    status: "ok",
    snapshots: dates.length,
    dates,
    next_collection: "Automated via GitHub Actions every Sunday 10am UTC",
  })
}
