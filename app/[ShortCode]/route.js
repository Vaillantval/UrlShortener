import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation'; // 👈 importe ça
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { shortCode } = await params;
  
  console.log('🔍 Redirection pour:', shortCode);

  const { data: link, error } = await supabase
    .from('links')
    .select('original_url, is_active, click_count')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  console.log('📦 Lien trouvé:', link);

  if (error || !link) {
    console.log('❌ Lien non trouvé');
    notFound(); // 👈 déclenche directement ton not-found.js sans redirect
  }

  // Enregistre le clic
  supabase
    .from('clics')
    .insert({ short_code: shortCode })
    .then(() => {
      supabase
        .from('links')
        .update({ click_count: link.click_count + 1 })
        .eq('short_code', shortCode);
    });

  console.log('✅ Redirection vers:', link.original_url);
  return NextResponse.redirect(link.original_url);
}