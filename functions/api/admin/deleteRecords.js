export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase keys" }), { status: 500 });
    }

    if (!data.table || !data.ids || !data.id_column || !Array.isArray(data.ids) || data.ids.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload: requires table, ids array, and id_column" }), { status: 400 });
    }

    const idsString = data.ids.map(id => encodeURIComponent(id)).join(',');

    const response = await fetch(`${supabaseUrl}/rest/v1/${data.table}?${data.id_column}=in.(${idsString})`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      // Look for Postgres foreign key constraint violation
      if (errText.includes("23503")) {
        return new Response(JSON.stringify({ error: "Cannot delete this record because it is referenced by other active records (e.g. an Investor with active Transactions or Leads). Delete those first." }), { status: 400 });
      }
      return new Response(JSON.stringify({ error: errText }), { status: response.status });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
