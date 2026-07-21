-- Disable Row Level Security on tables updated via Cloudflare APIs without Service Role Keys
ALTER TABLE public.registered_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_calculator_leads DISABLE ROW LEVEL SECURITY;
