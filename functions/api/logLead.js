export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
    }

    // Insert into profit_calculator_leads
    const payload = {
      account_id: data.phone,
      sector: data.sector,
      term_years: data.termYears,
      amount: data.amount,
      applied_rate: data.appliedRate,
      projected_profit: data.projectedProfit,
      maturity_value: data.maturityValue
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/profit_calculator_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(payload)
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
