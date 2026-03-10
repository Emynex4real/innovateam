-- Fix tutor_subscriptions
ALTER TABLE public.tutor_subscriptions DROP CONSTRAINT IF EXISTS tutor_subscriptions_tutor_id_fkey;
ALTER TABLE public.tutor_subscriptions ADD CONSTRAINT tutor_subscriptions_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix test_purchases
ALTER TABLE public.test_purchases DROP CONSTRAINT IF EXISTS test_purchases_student_id_fkey;
ALTER TABLE public.test_purchases ADD CONSTRAINT test_purchases_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix tutor_earnings
ALTER TABLE public.tutor_earnings DROP CONSTRAINT IF EXISTS tutor_earnings_tutor_id_fkey;
ALTER TABLE public.tutor_earnings ADD CONSTRAINT tutor_earnings_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix messages
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix announcements
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_tutor_id_fkey;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix notifications
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix forum_topics
ALTER TABLE public.forum_topics DROP CONSTRAINT IF EXISTS forum_topics_author_id_fkey;
ALTER TABLE public.forum_topics ADD CONSTRAINT forum_topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix forum_posts
ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;
ALTER TABLE public.forum_posts ADD CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix forum_likes
ALTER TABLE public.forum_likes DROP CONSTRAINT IF EXISTS forum_likes_user_id_fkey;
ALTER TABLE public.forum_likes ADD CONSTRAINT forum_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix student_badges
ALTER TABLE public.student_badges DROP CONSTRAINT IF EXISTS student_badges_student_id_fkey;
ALTER TABLE public.student_badges ADD CONSTRAINT student_badges_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix challenge_participants
ALTER TABLE public.challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_student_id_fkey;
ALTER TABLE public.challenge_participants ADD CONSTRAINT challenge_participants_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix study_plans
ALTER TABLE public.study_plans DROP CONSTRAINT IF EXISTS study_plans_student_id_fkey;
ALTER TABLE public.study_plans ADD CONSTRAINT study_plans_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Fix performance_heatmaps
ALTER TABLE public.performance_heatmaps DROP CONSTRAINT IF EXISTS performance_heatmaps_student_id_fkey;
ALTER TABLE public.performance_heatmaps ADD CONSTRAINT performance_heatmaps_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
