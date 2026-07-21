const fs = require('fs');

async function test() {
  const mod = await import('./functions/api/loginUser.js');
  const req = {
    json: async () => ({
      phone: '+919999999999'
    })
  };
  const env = {
    SUPABASE_URL: 'https://ncdzsvlqowigbjjqyslk.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'mock_key'
  };

  global.fetch = async (url, options) => {
    console.log("FETCH URL:", url);
    console.log("FETCH BODY:", options.body);
    return {
      ok: false,
      status: 400,
      text: async () => '{"message":"mock postgrest error"}'
    };
  };

  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
    }
  };

  try {
    const res = await mod.onRequestPost({ request: req, env });
    console.log('RESPONSE STATUS:', res.status);
    console.log('RESPONSE BODY:', res.body);
  } catch(e) {
    console.error('ERROR:', e);
  }
}
test();
