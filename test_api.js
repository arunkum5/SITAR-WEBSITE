const fs = require('fs');
async function test() {
  const mod = await import('./functions/api/updateProfile.js');
  const req = {
    json: async () => ({
      phone: '+919999999999',
      name: 'Test Name'
    })
  };
  const env = {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key'
  };
  
  // mock fetch
  global.fetch = async (url) => {
    return {
      ok: true,
      text: async () => 'mock error'
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
    console.log('STATUS:', res.status);
    console.log('BODY:', res.body);
  } catch(e) {
    console.error('ERROR:', e);
  }
}
test();
