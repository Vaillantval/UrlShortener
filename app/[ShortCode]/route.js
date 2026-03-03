import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export async function GET(request, { params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { shortCode } = await params;

  const { data: link, error } = await supabase
    .from('links')
    .select('original_url, is_active, click_count')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  if (error || !link) {
    return NextResponse.json({
      shortCode,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      error: error?.message ?? null,
      link,
    }, { status: 404 });
  }

  // Incrémente le compteur (non-bloquant)
  void supabase
    .from('links')
    .update({ click_count: (link.click_count || 0) + 1 })
    .eq('short_code', shortCode);

  // 302 = temporaire, non mis en cache par le navigateur
  return NextResponse.redirect(link.original_url, { status: 302 });
}