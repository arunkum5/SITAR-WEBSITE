export async function onRequestPost({ env }) {
  const supabaseUrl = env.SUPABASE_URL;
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

    // Helper to safely delete everything from a table using a dummy filter that is always true
    // We use id=not.is.null since all tables have 'id' (uuid or text) or 'transaction_id' or 'account_id'
    // To be perfectly safe, we match rows where created_at is not null, which exists on all these tables.
    const wipeTable = async (tableName, idCol) => {
        const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?${idCol}=not.is.null`, { 
            method: 'DELETE', headers 
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to clear ${tableName}: ${err}`);
        }
    };

    // 1. Clear transactions (depends on investors)
    await wipeTable('transactions', 'transaction_id');

    // 2. Clear profit_calculator_leads (used to depend on investors)
    await wipeTable('profit_calculator_leads', 'id');

    // 3. Clear bank_accounts (depends on investors)
    await wipeTable('bank_accounts', 'account_id');

    // 4. Clear investors (depends on registered_users conceptually)
    await wipeTable('investors', 'account_id');

    // 5. Clear registered_users
    await wipeTable('registered_users', 'id');

    return new Response(JSON.stringify({ success: true, message: "Database wiped completely and perfectly." }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
