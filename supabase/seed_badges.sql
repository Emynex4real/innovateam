-- Seed initial badges
INSERT INTO badges (code, name, description, icon, category, criteria, xp_reward) VALUES
-- Achievement Badges
('first_test', 'First Steps', 'Complete your first test', '🎯', 'achievement', 'Complete 1 test', 50),
('test_taker', 'Test Taker', 'Complete 50 tests', '📝', 'achievement', 'Complete 50 tests', 500),
('test_master', 'Test Master', 'Complete 100 tests', '🏆', 'achievement', 'Complete 100 tests', 1000),
('perfect_score', 'Perfect Score', 'Get 100% on any test', '💯', 'achievement', 'Score 100% on a test', 200),
('high_achiever', 'High Achiever', 'Get 90%+ on 10 tests', '⭐', 'achievement', 'Score 90%+ on 10 tests', 300),

-- Streak Badges
('streak_3', '3-Day Streak', 'Study for 3 days in a row', '🔥', 'streak', 'Maintain 3-day streak', 100),
('week_warrior', 'Week Warrior', 'Study for 7 days in a row', '💪', 'streak', 'Maintain 7-day streak', 250),
('month_master', 'Month Master', 'Study for 30 days in a row', '👑', 'streak', 'Maintain 30-day streak', 1000),

-- Mastery Badges
('xp_master', 'XP Master', 'Earn 1000 total XP', '⚡', 'mastery', 'Earn 1000 XP', 200),
('xp_legend', 'XP Legend', 'Earn 5000 total XP', '🌟', 'mastery', 'Earn 5000 XP', 500),
('level_10', 'Level 10', 'Reach level 10', '🎖️', 'mastery', 'Reach level 10', 300),
('level_25', 'Level 25', 'Reach level 25', '🏅', 'mastery', 'Reach level 25', 750),

-- Social Badges
('team_player', 'Team Player', 'Join a tutorial center', '👥', 'social', 'Join a center', 50),
('challenger', 'Challenger', 'Complete 5 challenges', '🎯', 'social', 'Complete 5 challenges', 300),

-- Special Badges
('early_bird', 'Early Bird', 'Study before 8 AM', '🌅', 'special', 'Complete test before 8 AM', 100),
('night_owl', 'Night Owl', 'Study after 10 PM', '🦉', 'special', 'Complete test after 10 PM', 100),
('speed_demon', 'Speed Demon', 'Complete test in under 5 minutes', '⚡', 'special', 'Complete test in <5 min', 150),
('comeback_kid', 'Comeback Kid', 'Improve score by 20%+', '📈', 'special', 'Improve by 20%', 200);
