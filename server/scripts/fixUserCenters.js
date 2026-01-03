require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function checkCurrentUser() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔍 Checking all users and their center assignments...\n');
  
  const { data: profiles } = await supabase.from('user_profiles').select('id, center_id, created_at').order('created_at', { ascending: false });
  
  console.log(`Found ${profiles?.length || 0} user profiles:\n`);
  
  profiles?.forEach((p, i) => {
    console.log(`${i + 1}. User: ${p.id.substring(0, 8)}...`);
    console.log(`   Center: ${p.center_id || '❌ NOT ASSIGNED'}`);
    console.log(`   Created: ${new Date(p.created_at).toLocaleString()}\n`);
  });
  
  const unassigned = profiles?.filter(p => !p.center_id) || [];
  
  if (unassigned.length > 0) {
    console.log(`⚠️  ${unassigned.length} users need center assignment\n`);
    
    const { data: center } = await supabase.from('tutorial_centers').select('id, name').eq('id', 'dc915189-23f8-4876-b5e7-940b9a001847').single();
    
    console.log(`Assigning to: ${center.name}\n`);
    
    for (const user of unassigned) {
      const { error } = await supabase.from('user_profiles').update({ center_id: center.id }).eq('id', user.id);
      if (!error) {
        console.log(`✅ Assigned ${user.id.substring(0, 8)}... to ${center.name}`);
      } else {
        console.log(`❌ Failed to assign ${user.id.substring(0, 8)}...`);
      }
    }
    
    console.log(`\n✨ Done! Refresh your browser.`);
  } else {
    console.log('✅ All users have centers assigned!');
  }
}

checkCurrentUser().then(() => process.exit(0)).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
