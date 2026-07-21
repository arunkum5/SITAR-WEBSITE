export async function onRequest({ env }) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
  }

  // The original hardcoded rates from rates.js
  const ratesData = [
    { sector: "villas", term_years: 1, interest_rate_pa: 9.5 },
    { sector: "villas", term_years: 2, interest_rate_pa: 10.5 },
    { sector: "villas", term_years: 3, interest_rate_pa: 11.5 },
    { sector: "villas", term_years: 4, interest_rate_pa: 11.8 },
    { sector: "villas", term_years: 5, interest_rate_pa: 12.0 },

    { sector: "apartments", term_years: 1, interest_rate_pa: 9.0 },
    { sector: "apartments", term_years: 2, interest_rate_pa: 10.0 },
    { sector: "apartments", term_years: 3, interest_rate_pa: 10.5 },
    { sector: "apartments", term_years: 4, interest_rate_pa: 10.8 },
    { sector: "apartments", term_years: 5, interest_rate_pa: 11.0 },

    { sector: "resorts", term_years: 1, interest_rate_pa: 10.0 },
    { sector: "resorts", term_years: 2, interest_rate_pa: 11.0 },
    { sector: "resorts", term_years: 3, interest_rate_pa: 11.5 },
    { sector: "resorts", term_years: 4, interest_rate_pa: 12.0 },
    { sector: "resorts", term_years: 5, interest_rate_pa: 12.5 },

    { sector: "commercial", term_years: 1, interest_rate_pa: 9.5 },
    { sector: "commercial", term_years: 2, interest_rate_pa: 10.5 },
    { sector: "commercial", term_years: 3, interest_rate_pa: 11.0 },
    { sector: "commercial", term_years: 4, interest_rate_pa: 11.5 },
    { sector: "commercial", term_years: 5, interest_rate_pa: 12.0 },

    { sector: "layouts", term_years: 1, interest_rate_pa: 10.5 },
    { sector: "layouts", term_years: 2, interest_rate_pa: 11.5 },
    { sector: "layouts", term_years: 3, interest_rate_pa: 12.0 },
    { sector: "layouts", term_years: 4, interest_rate_pa: 12.5 },
    { sector: "layouts", term_years: 5, interest_rate_pa: 13.0 }
  ];

  try {
    // We can insert multiple rows at once in PostgREST by passing an array
    const response = await fetch(`${supabaseUrl}/rest/v1/investment_plans`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ratesData)
    });

    if (!response.ok) {
        const errText = await response.text();
        return new Response(JSON.stringify({ error: "Failed to populate rates", details: errText }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, message: "Inserted all rates into investment_plans table." }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
