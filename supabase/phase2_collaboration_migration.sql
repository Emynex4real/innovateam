-- ============================================
-- PHASE 2: COLLABORATION & COMMUNICATION
-- ============================================
-- Run this migration after phase1_analytics_migration.sql

-- ============================================
-- 1. MESSAGING SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  participant_1_unread INTEGER DEFAULT 0,
  participant_2_unread INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(participant_1_id, participant_2_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participant1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conv_participant2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  message_text TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'image', 'file', 'video'
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_msg_created ON messages(created_at);

-- ============================================
-- 2. FORUMS & DISCUSSION BOARDS
-- ============================================
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color
  
  -- Stats
  thread_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Settings
  is_archived BOOLEAN DEFAULT FALSE,
  is_moderated BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(center_id, name)
);

CREATE INDEX IF NOT EXISTS idx_fc_center ON forum_categories(center_id);

CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Stats
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  
  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  last_reply_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ft_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_ft_center ON forum_threads(center_id);
CREATE INDEX IF NOT EXISTS idx_ft_creator ON forum_threads(creator_id);
CREATE INDEX IF NOT EXISTS idx_ft_is_solved ON forum_threads(is_solved);
CREATE INDEX IF NOT EXISTS idx_ft_created ON forum_threads(created_at);

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Hierarchy
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Stats
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Status
  is_marked_answer BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fp_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_fp_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_fp_parent ON forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_fp_created ON forum_posts(created_at);

CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  vote_type TEXT NOT NULL, -- 'upvote', 'downvote'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

-- ============================================
-- 3. STUDY GROUPS
-- ============================================
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Settings
  topic TEXT,
  subject TEXT,
  max_members INTEGER DEFAULT 50,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Stats
  member_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(center_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sg_center ON study_groups(center_id);
CREATE INDEX IF NOT EXISTS idx_sg_creator ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_sg_is_public ON study_groups(is_public);

CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  
  -- Activity
  contribution_score INTEGER DEFAULT 0,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_sgm_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_sgm_user ON study_group_members(user_id);

CREATE TABLE IF NOT EXISTS study_group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  attachment_url TEXT,
  resource_type TEXT, -- 'note', 'question', 'resource', 'discussion'
  
  -- Stats
  upvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sgp_group ON study_group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_sgp_author ON study_group_posts(author_id);

-- ============================================
-- 4. PEER TUTORING MARKETPLACE
-- ============================================
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Profile
  bio TEXT,
  image_url TEXT,
  hourly_rate DECIMAL(10, 2),
  
  -- Expertise
  subjects TEXT[], -- Array of subjects taught
  experience_years INTEGER,
  certification_url TEXT,
  
  -- Stats
  rating DECIMAL(3, 2) DEFAULT 5.0, -- 0-5 star rating
  review_count INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  total_hours_taught DECIMAL(8, 2) DEFAULT 0,
  
  -- Availability
  availability_status TEXT DEFAULT 'available', -- 'available', 'busy', 'unavailable'
  
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tutor_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_tp_tutor ON tutor_profiles(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tp_center ON tutor_profiles(center_id);
CREATE INDEX IF NOT EXISTS idx_tp_rating ON tutor_profiles(rating);

CREATE TABLE IF NOT EXISTS tutoring_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Details
  subject TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  
  -- Scheduling
  preferred_start_date DATE,
  preferred_time_slots TEXT[], -- Array of time slots
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'in_progress', 'completed'
  
  -- Pricing
  hourly_rate DECIMAL(10, 2),
  estimated_hours DECIMAL(4, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treq_student ON tutoring_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_treq_tutor ON tutoring_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_treq_status ON tutoring_requests(status);

CREATE TABLE IF NOT EXISTS tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES tutoring_requests(id) ON DELETE SET NULL,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  session_duration INTEGER, -- in minutes
  
  -- Meeting
  meeting_link TEXT,
  
  -- Progress
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  completed_at TIMESTAMPTZ,
  
  -- Feedback
  student_rating DECIMAL(3, 2),
  student_feedback TEXT,
  tutor_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ts_tutor ON tutoring_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_ts_student ON tutoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_ts_status ON tutoring_sessions(status);

CREATE TABLE IF NOT EXISTS tutor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES tutoring_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tr_tutor ON tutor_reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tr_reviewer ON tutor_reviews(reviewer_id);

-- ============================================
-- 5. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  type TEXT NOT NULL, -- 'message', 'forum', 'group', 'tutoring', 'achievement'
  title TEXT NOT NULL,
  description TEXT,
  
  -- Reference
  related_id UUID, -- ID of the related object (message, thread, etc.)
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Priority
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at);

-- ============================================
-- 6. GAMIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Profile
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  
  -- Criteria
  badge_type TEXT NOT NULL, -- 'achievement', 'milestone', 'special'
  criteria_type TEXT, -- 'test_score', 'study_hours', 'forum_posts', 'group_activity'
  criteria_value INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(center_id, name)
);

CREATE INDEX IF NOT EXISTS idx_badge_center ON badges(center_id);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_ub_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_ub_badge ON user_badges(badge_id);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Scoring
  points INTEGER DEFAULT 0,
  rank INTEGER,
  
  -- Breakdown
  test_points INTEGER DEFAULT 0,
  contribution_points INTEGER DEFAULT 0, -- forum, groups
  tutoring_points INTEGER DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0,
  
  -- Period
  period TEXT DEFAULT 'global', -- 'daily', 'weekly', 'monthly', 'global'
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(center_id, user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_le_center ON leaderboard_entries(center_id);
CREATE INDEX IF NOT EXISTS idx_le_user ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_le_points ON leaderboard_entries(points);

-- ============================================
-- 7. FUNCTIONS & TRIGGERS FOR PHASE 2
-- ============================================

-- Update conversation when message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.message_text,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation ON messages;
CREATE TRIGGER trigger_update_conversation
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- Update thread stats on new post
CREATE OR REPLACE FUNCTION update_thread_on_post()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET 
    reply_count = reply_count + 1,
    last_reply_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_thread ON forum_posts;
CREATE TRIGGER trigger_update_thread
AFTER INSERT ON forum_posts
FOR EACH ROW
WHEN (NEW.parent_post_id IS NULL)
EXECUTE FUNCTION update_thread_on_post();

-- Update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_groups
  SET member_count = (SELECT COUNT(*) FROM study_group_members WHERE group_id = NEW.group_id)
  WHERE id = NEW.group_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_group_count ON study_group_members;
CREATE TRIGGER trigger_update_group_count
AFTER INSERT OR DELETE ON study_group_members
FOR EACH ROW
EXECUTE FUNCTION update_group_member_count();

-- Update tutor rating
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
  review_cnt INTEGER;
BEGIN
  SELECT AVG(rating)::DECIMAL, COUNT(*)::INTEGER
  INTO avg_rating, review_cnt
  FROM tutor_reviews
  WHERE tutor_id = NEW.tutor_id;
  
  UPDATE tutor_profiles
  SET 
    rating = COALESCE(avg_rating, 5.0),
    review_count = review_cnt
  WHERE tutor_id = NEW.tutor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tutor_rating ON tutor_reviews;
CREATE TRIGGER trigger_update_tutor_rating
AFTER INSERT ON tutor_reviews
FOR EACH ROW
EXECUTE FUNCTION update_tutor_rating();

-- ============================================
-- 8. RLS POLICIES FOR PHASE 2
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see their own conversations
CREATE POLICY "Users view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages: Users can only see messages in their conversations
CREATE POLICY "Users view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Forum categories: Public per center
CREATE POLICY "Users view forum categories" ON forum_categories
  FOR SELECT USING (TRUE);

-- Forum threads: Users in center can view
CREATE POLICY "Users view forum threads" ON forum_threads
  FOR SELECT USING (TRUE);

-- Study groups: Members can view
CREATE POLICY "Members view study groups" ON study_groups
  FOR SELECT USING (
    is_public = TRUE OR 
    id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

-- Tutor profiles: Public
CREATE POLICY "View tutor profiles" ON tutor_profiles
  FOR SELECT USING (is_active = TRUE);

-- Notifications: Users see only their notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Leaderboard: Public per center
CREATE POLICY "View leaderboard" ON leaderboard_entries
  FOR SELECT USING (TRUE);
