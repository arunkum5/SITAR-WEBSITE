export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
    }

    if (!data.transaction_id || !data.status) {
      return new Response(JSON.stringify({ error: "Missing transaction_id or status" }), { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/transactions?transaction_id=eq.${data.transaction_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ status: data.status })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText }), { status: response.status });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
