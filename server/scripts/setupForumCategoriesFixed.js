require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_CATEGORIES = [
  { name: 'General Discussion', description: 'General topics, announcements, and community discussions', slug: 'general', icon: '💬', color: '#3B82F6', display_order: 1 },
  { name: 'Mathematics', description: 'Math questions, solutions, and problem-solving strategies', slug: 'mathematics', icon: '🔢', color: '#10B981', display_order: 2 },
  { name: 'English Language', description: 'Grammar, comprehension, and essay writing discussions', slug: 'english', icon: '📖', color: '#F59E0B', display_order: 3 },
  { name: 'Physics', description: 'Physics concepts, formulas, and practical applications', slug: 'physics', icon: '⚛️', color: '#8B5CF6', display_order: 4 },
  { name: 'Chemistry', description: 'Chemical reactions, equations, and laboratory discussions', slug: 'chemistry', icon: '🧪', color: '#EF4444', display_order: 5 },
  { name: 'Biology', description: 'Life sciences, anatomy, and biological processes', slug: 'biology', icon: '🧬', color: '#06B6D4', display_order: 6 },
  { name: 'Study Tips & Resources', description: 'Share study techniques, resources, and exam preparation tips', slug: 'study-tips', icon: '📚', color: '#EC4899', display_order: 7 },
  { name: 'Technical Support', description: 'Platform issues, bugs, and feature requests', slug: 'support', icon: '🛠️', color: '#6B7280', display_order: 8 }
];

async function setupForumCategories(centerId) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🚀 Setting up forum categories...\n');
  
  if (!centerId) throw new Error('Center ID required. Usage: node setupForumCategoriesFixed.js <center-id>');
  
  const { data: center, error: centerError } = await supabase.from('tutorial_centers').select('id, name').eq('id', centerId).single();
  if (centerError || !center) throw new Error(`Tutorial center not found: ${centerId}`);
  
  console.log(`✅ Found center: ${center.name}\n`);
  
  const { data: existing } = await supabase.from('forum_categories').select('slug').eq('center_id', centerId);
  const existingSlugs = new Set(existing?.map(c => c.slug) || []);
  
  let created = 0, skipped = 0;
  
  for (const category of DEFAULT_CATEGORIES) {
    if (existingSlugs.has(category.slug)) {
      console.log(`⏭️  Skipped: ${category.name} (already exists)`);
      skipped++;
      continue;
    }
    
    const { error } = await supabase.from('forum_categories').insert({ center_id: centerId, ...category });
    
    if (error) {
      console.error(`❌ Failed to create ${category.name}:`, error.message);
    } else {
      console.log(`✅ Created: ${category.name}`);
      created++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary: Created: ${created}, Skipped: ${skipped}, Total: ${DEFAULT_CATEGORIES.length}`);
  console.log('='.repeat(50));
  console.log('\n✨ Forum setup complete!\n');
}

const centerId = process.argv[2];
setupForumCategories(centerId).then(() => process.exit(0)).catch(err => { console.error('\n❌ Error:', err.message); process.exit(1); });
