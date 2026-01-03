require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function diagnose() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔍 Forum Diagnostic Report\n');
  console.log('='.repeat(60));
  
  // 1. Check tutorial centers
  const { data: centers } = await supabase.from('tutorial_centers').select('id, name');
  console.log(`\n📍 Tutorial Centers (${centers?.length || 0}):`);
  centers?.forEach(c => console.log(`   - ${c.name} (${c.id})`));
  
  // 2. Check forum categories for each center
  console.log(`\n📁 Forum Categories:`);
  for (const center of centers || []) {
    const { data: cats } = await supabase.from('forum_categories').select('name').eq('center_id', center.id);
    console.log(`   ${center.name}: ${cats?.length || 0} categories`);
    cats?.forEach(cat => console.log(`      - ${cat.name}`));
  }
  
  // 3. Check users and their center assignments
  const { data: users } = await supabase.from('user_profiles').select('id, center_id').limit(5);
  console.log(`\n👥 Sample Users (${users?.length || 0}):`);
  users?.forEach(u => console.log(`   - User ${u.id.substring(0, 8)}... → Center: ${u.center_id || 'NOT ASSIGNED'}`));
  
  // 4. Check if current logged-in user has center
  console.log(`\n💡 Recommendations:`);
  const usersWithoutCenter = users?.filter(u => !u.center_id).length || 0;
  if (usersWithoutCenter > 0) {
    console.log(`   ⚠️  ${usersWithoutCenter} users don't have a center assigned`);
    console.log(`   → Run: node scripts/assignUsersToCenter.js`);
  }
  
  const centersWithoutCategories = centers?.filter(c => {
    const { data } = supabase.from('forum_categories').select('id').eq('center_id', c.id);
    return !data || data.length === 0;
  }).length || 0;
  
  if (centersWithoutCategories > 0) {
    console.log(`   ⚠️  Some centers don't have forum categories`);
    console.log(`   → Run: node scripts/setupForumCategoriesFixed.js <center-id>`);
  }
  
  console.log('\n' + '='.repeat(60));
}

diagnose().then(() => process.exit(0)).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
