import { supabase } from './db';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await supabase
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

testConnection(); 