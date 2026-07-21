export async function onRequestPost({ request, env }) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
  }

  try {
    const data = await request.json();
    const phone = data.phone || "Unknown";

    // Upsert into investors to prevent foreign key constraint violations
    const investorsPayload = {
      account_id: phone,
      name: "Investor",
      pan_number: `TEMP-${phone}`,
      aadhar_number: `TEMP-${phone}`,
    };

    const invResponse = await fetch(`${supabaseUrl}/rest/v1/investors?on_conflict=account_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(investorsPayload)
    });

    // If ignoring duplicates fails entirely (unlikely), we just proceed
    // The foreign key constraint relies on the account_id being present.

    const payload = {
      account_id: phone, // user identifier
      sector: data.sector,
      term_years: data.term,
      invested_amount: data.amount,
      applied_interest_rate: data.rate,
      maturity_date: data.maturity_date,
      maturity_amount: data.maturity_amount,
      status: 'Active'
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errBody = await response.text();
        return new Response(JSON.stringify({ error: `Supabase Error: ${errBody}` }), { status: response.status });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
