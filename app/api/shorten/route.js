import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const { url, customCode, userId } = await request.json();

    // Validation basique de l'URL
    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }

    try {
      new URL(url); // Vérifie que c'est une URL valide
    } catch {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    // Génère un code court (custom ou aléatoire)
    const shortCode = customCode?.trim() || nanoid(6);

    // Insère dans Supabase
    const { data, error } = await supabase
      .from('links')
      .insert({
        short_code: shortCode,
        original_url: url,
        user_id: userId || null,
        custom_alias: !!customCode,
      })
      .select()
      .single();

    if (error) {
      // Code déjà pris
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ce code est déjà utilisé, essaie un autre.' },
          { status: 409 }
        );
      }
      throw error;
    }

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;

    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl: url,
      id: data.id,
    });

  } catch (err) {
    console.error('Erreur shorten:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}