export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Allow the login endpoint to bypass authentication
  if (url.pathname.endsWith('/api/admin/login')) {
    return next();
  }

  // Check for the secure cookie
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized: No session cookie" }), { status: 401 });
  }

  const expectedToken = btoa(env.ADMIN_PASSWORD + "-admin-session-sitar");
  
  // Parse cookies
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, ...rest] = cookie.split('=');
    acc[name.trim()] = rest.join('=').trim();
    return acc;
  }, {});

  if (cookies['admin_session'] !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid session" }), { status: 401 });
  }

  // If authenticated, proceed to the actual API endpoint
  return next();
}
