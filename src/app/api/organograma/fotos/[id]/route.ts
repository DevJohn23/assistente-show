import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { organizationThumbnail } from '@/lib/organizationThumbnail';
import { organizationPhotoVersion } from '@/lib/organizationPhotoCache';

const unavailable = (status: number) => new NextResponse(null, { status, headers: { 'Cache-Control': 'private, no-store', Vary: 'Authorization' } });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return unavailable(401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return unavailable(503);
  const client = createClient(url, key, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: auth, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !auth.user) return unavailable(401);
  const { data, error: readError } = await client.from('org_employees').select('photo_path').eq('id', params.id).single();
  if (readError || !data?.photo_path) return unavailable(404);
  const version = request.nextUrl.searchParams.get('v');
  if (version && version !== organizationPhotoVersion(data.photo_path)) return unavailable(409);
  try {
    const { data: photo, error: photoError } = await client.storage.from('organization-photos').download(data.photo_path);
    if (photoError || !photo) return unavailable(404);
    const thumbnail = await organizationThumbnail(await photo.arrayBuffer());
    return new NextResponse(new Uint8Array(thumbnail), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': version ? 'private, max-age=300' : 'private, no-store', Vary: 'Authorization', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return unavailable(404); }
}
