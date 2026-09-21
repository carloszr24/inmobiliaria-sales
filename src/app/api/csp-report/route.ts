import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = (await request.text().catch(() => '')).slice(0, 1000)
  console.warn('CSP report-only violation:', body)
  return new NextResponse(null, { status: 204 })
}
