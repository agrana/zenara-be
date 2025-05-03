import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Create a separate Supabase client for testing
export const testSupabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilMpm4vgzjkU'
);

// For backward compatibility with existing code
export const db = testSupabase;

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await testSupabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Database response:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Only run the test if this file is executed directly
if (require.main === module) {
  testConnection();
} 