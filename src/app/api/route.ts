import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'LifeLink API',
    version: '2.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
