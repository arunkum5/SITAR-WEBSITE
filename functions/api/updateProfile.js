export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    // Default phone for testing if none provided
    const phone = data.phone || "+919999999999";

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: "Server misconfiguration: Missing Supabase keys in Cloudflare Env" }), { status: 500 });
    }

    // Call Supabase REST API to Upsert (Insert or Update based on phone unique constraint)
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        phone: phone,
        pan_number: data.pan,
        aadhar_masked: data.aadhar,
        nominee_name: data.nomineeName,
        nominee_relation: data.nomineeRel,
        nominee_phone: data.nomineePhone,
        bank_account: data.bankAcc,
        bank_ifsc: data.bankIfsc,
        bank_type: data.bankType
      })
    });

    if (!response.ok) {
        const errBody = await response.text();
        return new Response(JSON.stringify({ error: `Supabase Error: ${errBody}` }), { status: response.status });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
