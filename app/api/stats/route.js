import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Auth check via session
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Data queries via service role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [{ data: links }, { data: clicks }] = await Promise.all([
    supabase
      .from('links')
      .select('id, short_code, original_url, click_count, created_at, is_active')
      .eq('user_id', user.id)
      .order('click_count', { ascending: false }),
    supabase
      .from('clicks')
      .select('short_code, clicked_at, device_type')
      .in(
        'short_code',
        await supabase
          .from('links')
          .select('short_code')
          .eq('user_id', user.id)
          .then(({ data }) => (data ?? []).map((l) => l.short_code))
      ),
  ]);

  // Clicks by day (last 7 days)
  const clicksByDay = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    clicksByDay[key] = 0;
  }
  (clicks ?? []).forEach(({ clicked_at }) => {
    const day = clicked_at?.slice(0, 10);
    if (day && day in clicksByDay) clicksByDay[day]++;
  });

  // Clicks by device
  const clicksByDevice = {};
  (clicks ?? []).forEach(({ device_type }) => {
    const d = device_type || 'Desktop';
    clicksByDevice[d] = (clicksByDevice[d] || 0) + 1;
  });

  const totalLinks = (links ?? []).length;
  const totalClicks = (links ?? []).reduce((s, l) => s + (l.click_count || 0), 0);
  const topLinks = (links ?? []).slice(0, 5);

  return NextResponse.json({
    totalLinks,
    totalClicks,
    clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })),
    clicksByDevice: Object.entries(clicksByDevice).map(([device, count]) => ({ device, count })),
    topLinks,
  });
}
