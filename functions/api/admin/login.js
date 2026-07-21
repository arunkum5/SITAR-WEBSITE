export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    if (!env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Server misconfiguration: ADMIN_PASSWORD not set" }), { status: 500 });
    }

    if (data.password !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
    }

    // Generate a simple token based on the password (for verification in other APIs)
    const token = btoa(env.ADMIN_PASSWORD + "-admin-session-sitar");

    const headers = new Headers();
    // Set an HTTP-Only, Secure cookie that expires in 24 hours
    headers.append('Set-Cookie', `admin_session=${token}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=86400`);
    headers.append('Content-Type', 'application/json');

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
