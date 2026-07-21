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
    let searchPhone = phone;
    if (searchPhone.length === 10) {
      searchPhone = `+91${searchPhone}`;
    } else if (searchPhone.length > 10 && !searchPhone.startsWith('+')) {
       searchPhone = `+${searchPhone}`;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/transactions?account_id=eq.${encodeURIComponent(searchPhone)}&select=*&order=transaction_date.desc`, {
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
