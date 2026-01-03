require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function findCenterId() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔍 Finding tutorial centers...\n');
  
  const { data, error } = await supabase.from('tutorial_centers').select('id, name, created_at').order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  if (!data || data.length === 0) {
    console.log('❌ No tutorial centers found. Please create one first.');
    process.exit(1);
  }
  
  console.log('📋 Available Tutorial Centers:\n');
  data.forEach((center, i) => {
    console.log(`${i + 1}. ${center.name}`);
    console.log(`   ID: ${center.id}`);
    console.log(`   Created: ${new Date(center.created_at).toLocaleDateString()}\n`);
  });
  
  console.log('💡 Use this command to setup forums:');
  console.log(`   node scripts/setupForumCategoriesFixed.js ${data[0].id}\n`);
}

findCenterId().then(() => process.exit(0)).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
