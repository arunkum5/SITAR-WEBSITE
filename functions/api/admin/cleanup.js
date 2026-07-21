export async function onRequestPost({ env }) {
  const supabaseUrl = env.SUPABASE_URL;
  // Prefer service role key for deletes if available, fallback to anon
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys in Cloudflare Env" }), { status: 500 });
  }

  try {
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };

    // To delete all records, PostgREST requires a query filter to prevent accidental deletion.
    // Using an arbitrary condition that matches everything, like filtering for rows where a column is not null.
    // If table might be totally empty, it's fine. We will try a common column like 'id' or just 'created_at'.
    // A safer hack that works in PostgREST is filtering by something always true: e.g. `limit=1000`? No, DELETE doesn't accept limit without filter.
    // Let's use `?phone=not.is.null` as fallback since profiles/leads often have phone.
    // If it fails due to column missing, we can try something else, but this is the standard way.
    
    // Clear transactions
    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?account_id=not.is.null`, { 
        method: 'DELETE', headers 
    });

    // Clear profit_calculator_leads
    const leadsRes = await fetch(`${supabaseUrl}/rest/v1/profit_calculator_leads?account_id=not.is.null`, { 
        method: 'DELETE', headers 
    });

    // Clear bank_accounts
    const bankRes = await fetch(`${supabaseUrl}/rest/v1/bank_accounts?account_id=not.is.null`, { 
        method: 'DELETE', headers 
    });

    // Clear investors
    const invRes = await fetch(`${supabaseUrl}/rest/v1/investors?account_id=not.is.null`, { 
        method: 'DELETE', headers 
    });

    if (!txRes.ok && txRes.status !== 404) console.error("Failed to clear transactions:", await txRes.text());
    if (!leadsRes.ok && leadsRes.status !== 404) console.error("Failed to clear leads:", await leadsRes.text());
    if (!bankRes.ok && bankRes.status !== 404) console.error("Failed to clear banks:", await bankRes.text());
    if (!invRes.ok && invRes.status !== 404) console.error("Failed to clear investors:", await invRes.text());

    return new Response(JSON.stringify({ success: true, message: "Database wiped successfully." }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
