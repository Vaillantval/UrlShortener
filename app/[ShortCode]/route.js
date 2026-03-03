import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

function getDeviceType(ua = '') {
  if (/tablet|ipad/i.test(ua)) return 'Tablette';
  if (/mobile|iphone|ipod|android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

export async function GET(request, { params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const resolvedParams = await params;
  const shortCode = resolvedParams.ShortCode ?? resolvedParams.shortCode;

  const { data: link, error } = await supabase
    .from('links')
    .select('original_url, is_active, click_count')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  if (error || !link) {
    notFound();
  }

  const ua = request.headers.get('user-agent') ?? '';
  const deviceType = getDeviceType(ua);
  const referrer = request.headers.get('referer') ?? null;

  // Enregistre le clic et incrémente le compteur (non-bloquant)
  void supabase.from('clicks').insert({
    short_code: shortCode,
    device_type: deviceType,
    referrer: referrer,
  });

  void supabase
    .from('links')
    .update({ click_count: (link.click_count || 0) + 1 })
    .eq('short_code', shortCode);

  // 302 = temporaire, non mis en cache par le navigateur
  return NextResponse.redirect(link.original_url, { status: 302 });
}