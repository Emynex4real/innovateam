require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function assignUsersToCenter(centerId) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔄 Assigning users to center...\n');
  
  if (!centerId) {
    const { data: centers } = await supabase.from('tutorial_centers').select('id, name').limit(1).single();
    if (!centers) throw new Error('No centers found');
    centerId = centers.id;
    console.log(`Using default center: ${centers.name} (${centerId})\n`);
  }
  
  const { data: users } = await supabase.from('user_profiles').select('id, center_id').is('center_id', null);
  
  console.log(`Found ${users?.length || 0} users without a center\n`);
  
  if (!users || users.length === 0) {
    console.log('✅ All users already have a center assigned!');
    return;
  }
  
  let updated = 0;
  for (const user of users) {
    const { error } = await supabase.from('user_profiles').update({ center_id: centerId }).eq('id', user.id);
    if (!error) {
      updated++;
      console.log(`✅ Assigned user ${user.id.substring(0, 8)}... to center`);
    }
  }
  
  console.log(`\n📊 Updated ${updated} users`);
}

const centerId = process.argv[2];
assignUsersToCenter(centerId).then(() => process.exit(0)).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
