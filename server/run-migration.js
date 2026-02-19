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
    console.log('🚀 Running grace period migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'add_grace_periods.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.error('❌ Error executing statement:', error.message);
          console.log('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. The grace period system is now active');
    console.log('3. Users exceeding limits will get 7 days grace period');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
