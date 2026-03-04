import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

export async function GET(request, { params }) {
  const { shortCode } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: link } = await supabase
    .from('links')
    .select('short_code')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single();

  if (!link) {
    return new Response(JSON.stringify({ error: 'Lien introuvable' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://urls.lat';
  const shortUrl = `${baseUrl}/${shortCode}`;

  const buffer = await QRCode.toBuffer(shortUrl, {
    type: 'png',
    width: 300,
    margin: 2,
  });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
