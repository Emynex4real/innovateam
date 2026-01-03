-- Phase 2 Schema: Monetization, Communication, Analytics, Gamification
-- Run this AFTER phase1_enhancements.sql

-- ============================================
-- MONETIZATION TABLES
-- ============================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period VARCHAR(20) NOT NULL,
  max_students INTEGER,
  max_questions INTEGER,
  max_tests INTEGER,
  commission_rate DECIMAL(5,2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tutor Subscriptions
CREATE TABLE IF NOT EXISTS tutor_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Paid Tests
CREATE TABLE IF NOT EXISTS paid_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Purchases
CREATE TABLE IF NOT EXISTS test_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  purchased_at TIMESTAMP DEFAULT NOW()
);

-- Tutor Earnings
CREATE TABLE IF NOT EXISTS tutor_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES test_purchases(id),
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum Topics
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forum Likes
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50),
  criteria TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student Badges
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  badge_code VARCHAR(50),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  reward_xp INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, student_id)
);

-- Study Plans
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study Plan Items
CREATE TABLE IF NOT EXISTS study_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  item_type VARCHAR(50),
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  order_index INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- Performance Heatmaps
CREATE TABLE IF NOT EXISTS performance_heatmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(100),
  date DATE NOT NULL,
  score DECIMAL(5,2),
  tests_taken INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_tutor_subscriptions_tutor ON tutor_subscriptions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subscriptions_status ON tutor_subscriptions(status);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_test_purchases_student ON test_purchases(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_tutor ON tutor_earnings(tutor_id);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_center ON forum_topics(center_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_challenges_center ON challenges(center_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_student ON challenge_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_student ON study_plans(student_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_performance_heatmaps_center ON performance_heatmaps(center_id);
CREATE INDEX IF NOT EXISTS idx_performance_heatmaps_student ON performance_heatmaps(student_id);

-- ============================================
-- SEED SUBSCRIPTION PLANS
-- ============================================

INSERT INTO subscription_plans (name, price, billing_period, max_students, max_questions, max_tests, commission_rate, features) VALUES
('Free', 0.00, 'monthly', 50, 100, 10, 20.00, '{"analytics": "basic", "support": "community"}'),
('Pro', 9.99, 'monthly', 200, 500, 50, 15.00, '{"analytics": "advanced", "support": "priority", "custom_branding": false}'),
('Premium', 29.99, 'monthly', NULL, NULL, NULL, 10.00, '{"analytics": "full", "support": "dedicated", "custom_branding": true, "api_access": true}')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE REALTIME (Run in Supabase Dashboard)
-- ============================================

-- Go to Database > Replication and enable for:
-- - messages
-- - notifications
-- - announcements
