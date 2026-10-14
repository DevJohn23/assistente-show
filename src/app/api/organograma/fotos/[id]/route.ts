import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return new NextResponse(null, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new NextResponse(null, { status: 503 });
  const client = createClient(url, key, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: auth, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !auth.user) return new NextResponse(null, { status: 401 });
  const { data, error: readError } = await client.from('org_employees').select('photo_path').eq('id', params.id).single();
  if (readError || !data?.photo_path) return new NextResponse(null, { status: 404 });
  try {
    const { data: photo, error: photoError } = await client.storage.from('organization-photos').download(data.photo_path);
    if (photoError || !photo) return new NextResponse(null, { status: 404 });
    return new NextResponse(photo, { headers: { 'Content-Type': photo.type || 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new NextResponse(null, { status: 404 }); }
}
