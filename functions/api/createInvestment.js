export async function onRequestPost({ request, env }) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
  }

  try {
    const data = await request.json();
    let phone = data.phone || "Unknown";
    
    // Normalize phone to prevent unique constraint pan_number collisions 
    // caused by mixing "9999999999" and "+919999999999" account_ids
    if (phone.length === 10 && !phone.startsWith('+')) {
      phone = `+91${phone}`;
    } else if (phone.length > 10 && !phone.startsWith('+')) {
      phone = `+${phone}`;
    }

    // Check if investor already exists to prevent overwriting their real profile data with defaults
    let invResponse = await fetch(`${supabaseUrl}/rest/v1/investors?account_id=eq.${encodeURIComponent(phone)}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    let invData = await invResponse.json();

    // If investor doesn't exist, create a default profile for them
    if (!invData || invData.length === 0) {
      const investorsPayload = {
        account_id: phone,
        name: "Investor",
        pan_number: `T${phone.replace(/\D/g, '').slice(-9)}`.padEnd(10, '0'),
        aadhar_number: `T0${phone.replace(/\D/g, '').slice(-10)}`.padEnd(12, '0'),
      };

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/investors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(investorsPayload)
      });

      if (!insertRes.ok) {
          const errBody = await insertRes.text();
          return new Response(JSON.stringify({ error: `Investors Insert Failed: ${errBody}` }), { status: insertRes.status });
      }
      invData = await insertRes.json();
    }
    const folioNumber = invData && invData.length > 0 ? invData[0].folio_number : 'SWB' + Math.floor(100000 + Math.random() * 900000);
    const investorName = invData && invData.length > 0 ? invData[0].name : 'Valued Investor';

    const payload = {
      account_id: phone, // user identifier
      sector: data.sector,
      term_years: data.term,
      invested_amount: data.amount,
      applied_interest_rate: data.rate,
      maturity_date: data.maturity_date,
      maturity_amount: data.maturity_amount,
      withdraw_period: data.withdraw_period || 'On maturity',
      status: 'Pending'
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

    return new Response(JSON.stringify({ success: true, folio_number: folioNumber, name: investorName }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
