const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running vote system rebuild migration...\n');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/rebuild-vote-system.sql'),
      'utf8'
    );
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Vote system rebuilt successfully!');
    console.log('\nChanges:');
    console.log('  - Dropped old triggers and functions');
    console.log('  - Created optimized vote count triggers');
    console.log('  - Recalculated all existing vote counts');
    console.log('\n✨ Vote system is now using industry-standard patterns');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
