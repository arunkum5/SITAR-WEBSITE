export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    // Default phone for testing if none provided
    const phone = data.phone || "+919999999999";

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: "Server misconfiguration: Missing Supabase keys in Cloudflare Env" }), { status: 500 });
    }

    try {
      // 1. Upsert into investors table
      const investorsPayload = {
        account_id: phone, // Using phone as the primary account_id
        name: data.name || '-',
        pan_number: data.pan || `TEMP-${phone}`,
        aadhar_number: data.aadhar || `TEMP-${phone}`,
        nominee_name: data.nomineeName || null,
        nominee_contact: data.nomineePhone || null,
      };

      const invResponse = await fetch(`${supabaseUrl}/rest/v1/investors?on_conflict=account_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(investorsPayload)
      });

      if (!invResponse.ok) {
        const errText = await invResponse.text();
        return new Response(JSON.stringify({ error: `Failed to update investors: ${errText}` }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. Delete existing bank accounts for this investor to replace with new one
      await fetch(`${supabaseUrl}/rest/v1/bank_accounts?account_id=eq.${encodeURIComponent(phone)}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      // 3. Insert new bank account
      const bankPayload = {
        account_id: phone,
        account_name: data.name || '-',
        account_type: 'Savings', // Frontend doesn't explicitly send type, defaulting to Savings
        account_number: data.bankAcc || '-',
        ifsc_code: data.bankIfsc || '-'
      };

      const bankResponse = await fetch(`${supabaseUrl}/rest/v1/bank_accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(bankPayload)
      });

      if (!bankResponse.ok) {
         const errText = await bankResponse.text();
         console.warn("Failed to insert bank account", errText);
         // We still return success since main profile saved, but this is a note
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
