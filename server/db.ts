import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";
import 'dotenv/config';

let supabaseClient;

if (process.env.NODE_ENV === 'test') {
  // In test environment, use the test client
  const { testSupabase } = require('./test-db');
  supabaseClient = testSupabase;
} else {
  // In production/development, use the real client
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set. Did you forget to configure Supabase?",
    );
  }

  supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

export const supabase = supabaseClient;
export const db = supabaseClient;