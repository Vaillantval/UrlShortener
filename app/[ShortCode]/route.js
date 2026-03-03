import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { shortCode } = await params;

  const { data: link, error } = await supabase
    .from('links')
    .select('original_url, is_active, click_count')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  if (error || !link) {
    notFound();
  }

  // Incrément du compteur de clics (non-bloquant — la redirection ne doit pas attendre l'analytics)
  void supabase
    .from('links')
    .update({ click_count: (link.click_count || 0) + 1 })
    .eq('short_code', shortCode);

  return NextResponse.redirect(link.original_url, { status: 301 });
}
