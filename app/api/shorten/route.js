import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Client serveur direct — createBrowserClient (lib/supabase.js) est réservé au navigateur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { url, customCode, userId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    // Valide le format du code personnalisé
    const trimmedCode = customCode?.trim();
    if (trimmedCode && !/^[a-zA-Z0-9_-]{2,16}$/.test(trimmedCode)) {
      return NextResponse.json(
        { error: 'Le code doit contenir 2 à 16 caractères (lettres, chiffres, - ou _)' },
        { status: 400 }
      );
    }

    const shortCode = trimmedCode || nanoid(6);

    const { data, error } = await supabase
      .from('links')
      .insert({
        short_code: shortCode,
        original_url: url,
        user_id: userId || null,
        custom_alias: !!trimmedCode,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ce code est déjà utilisé, essaie un autre.' },
          { status: 409 }
        );
      }
      throw error;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      shortUrl: `${baseUrl}/${shortCode}`,
      shortCode,
      originalUrl: url,
      id: data.id,
    });
  } catch (err) {
    console.error('[API /shorten]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}