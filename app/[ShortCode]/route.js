import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// On crée un client serveur ici directement
// car createBrowserClient (lib/supabase.js) est réservé au navigateur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  // Incrémente le compteur (non-bloquant)
  void supabase
    .from('links')
    .update({ click_count: (link.click_count || 0) + 1 })
    .eq('short_code', shortCode);

  // 302 = temporaire, non mis en cache par le navigateur
  return NextResponse.redirect(link.original_url, { status: 302 });
}