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
    if (searchPhone.length === 10 && !searchPhone.startsWith('+')) {
      searchPhone = `+91${searchPhone}`;
    } else if (searchPhone.length > 10 && !searchPhone.startsWith('+')) {
       searchPhone = `+${searchPhone}`;
    }

    // Fetch investor profile
    const invRes = await fetch(`${supabaseUrl}/rest/v1/investors?account_id=eq.${encodeURIComponent(searchPhone)}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!invRes.ok) {
        const errBody = await invRes.text();
        return new Response(JSON.stringify({ error: `Supabase Error: ${errBody}` }), { status: invRes.status });
    }
    
    const invData = await invRes.json();
    const investor = invData.length > 0 ? invData[0] : null;

    // Fetch bank account
    let bank = null;
    if (investor) {
      const bankRes = await fetch(`${supabaseUrl}/rest/v1/bank_accounts?account_id=eq.${encodeURIComponent(searchPhone)}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        bank = bankData.length > 0 ? bankData[0] : null;
      }
    }

    return new Response(JSON.stringify({ investor, bank }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
