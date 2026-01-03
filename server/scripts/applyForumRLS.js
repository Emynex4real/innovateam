require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyRLSFix() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔧 Applying RLS policy fixes...\n');
  
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/fix-forum-rls.sql'), 'utf8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Error applying RLS fixes:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/sql/new\n');
    console.log(sql);
    process.exit(1);
  }
  
  console.log('✅ RLS policies updated successfully!\n');
  console.log('🔄 Refresh your browser to see the forum categories.\n');
}

applyRLSFix().then(() => process.exit(0)).catch(err => { 
  console.error('❌ Error:', err.message);
  console.log('\n📋 Please run the SQL manually in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/sql/new\n');
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/fix-forum-rls.sql'), 'utf8');
  console.log(sql);
  process.exit(1);
});
