export async function onRequestGet({ request, env }) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
  }

  const url = new URL(request.url);
  const phone = url.searchParams.get('phone');

  if (!phone) {
    return new Response(JSON.stringify({ error: "Phone number required" }), { status: 400 });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/transactions?account_id=eq.${encodeURIComponent(phone)}&select=*&order=transaction_date.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
        const errBody = await response.text();
        return new Response(JSON.stringify({ error: `Supabase Error: ${errBody}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
