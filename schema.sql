-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.investors (
  account_id character varying NOT NULL,
  name character varying NOT NULL,
  pan_number character varying NOT NULL UNIQUE,
  aadhar_number character varying NOT NULL UNIQUE,
  nominee_name character varying,
  nominee_contact character varying,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT investors_pkey PRIMARY KEY (account_id)
);

CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  account_id character varying,
  account_name character varying NOT NULL,
  account_type character varying NOT NULL,
  account_number character varying NOT NULL,
  ifsc_code character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT bank_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.investors(account_id)
);

CREATE TABLE public.investment_plans (
  id integer NOT NULL DEFAULT nextval('investment_plans_id_seq'::regclass),
  sector character varying NOT NULL,
  term_years integer NOT NULL,
  interest_rate_pa numeric NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT investment_plans_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transactions (
  transaction_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  account_id character varying,
  transaction_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  invested_amount numeric NOT NULL,
  sector character varying NOT NULL,
  term_years integer NOT NULL,
  applied_interest_rate numeric NOT NULL,
  maturity_date date NOT NULL,
  maturity_amount numeric NOT NULL,
  status character varying DEFAULT 'Active'::character varying,
  CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.investors(account_id)
);

CREATE TABLE public.profit_calculator_leads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sector character varying NOT NULL,
  term_years integer NOT NULL,
  amount numeric NOT NULL,
  applied_rate numeric NOT NULL,
  projected_profit numeric NOT NULL,
  maturity_value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  account_id character varying,
  CONSTRAINT profit_calculator_leads_pkey PRIMARY KEY (id),
  CONSTRAINT profit_calculator_leads_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.investors(account_id)
);

CREATE TABLE public.registered_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  phone_number character varying NOT NULL UNIQUE,
  last_login timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT registered_users_pkey PRIMARY KEY (id)
);
