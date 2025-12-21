const supabase = require('../supabaseClient');

class GamificationService {
  // Badge Management
  async getStudentBadges(studentId) {
    const { data, error } = await supabase
      .from('student_badges')
      .select('*, badges(*)')
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async checkAndAwardBadges(studentId) {
    const { data: analytics } = await supabase
      .from('student_analytics')
      .select('*')
      .eq('student_id', studentId)
      .single();

    const badges = [];
    
    // Check badge criteria
    if (analytics.total_xp >= 1000 && !await this.hasBadge(studentId, 'xp_master')) {
      badges.push(await this.awardBadge(studentId, 'xp_master'));
    }
    if (analytics.current_streak >= 7 && !await this.hasBadge(studentId, 'week_warrior')) {
      badges.push(await this.awardBadge(studentId, 'week_warrior'));
    }
    if (analytics.tests_taken >= 50 && !await this.hasBadge(studentId, 'test_taker')) {
      badges.push(await this.awardBadge(studentId, 'test_taker'));
    }

    return badges;
  }

  async hasBadge(studentId, badgeCode) {
    const { data } = await supabase
      .from('student_badges')
      .select('id')
      .eq('student_id', studentId)
      .eq('badge_code', badgeCode)
      .single();
    return !!data;
  }

  async awardBadge(studentId, badgeCode) {
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('code', badgeCode)
      .single();

    if (!badge) return null;

    const { data, error } = await supabase
      .from('student_badges')
      .insert({
        student_id: studentId,
        badge_id: badge.id,
        badge_code: badgeCode
      })
      .select('*, badges(*)')
      .single();

    if (error) throw error;
    return data;
  }

  // Challenge Management
  async getActiveChallenges(centerId) {
    const { data, error } = await supabase
      .from('challenges')
      .select('*, challenge_participants(*)')
      .eq('center_id', centerId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getStudentChallenges(studentId) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('*, challenges(*)')
      .eq('student_id', studentId)
      .order('joined_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createChallenge(tutorId, challengeData) {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        center_id: challengeData.centerId,
        title: challengeData.title,
        description: challengeData.description,
        challenge_type: challengeData.type,
        target_value: challengeData.targetValue,
        reward_xp: challengeData.rewardXp,
        start_date: challengeData.startDate,
        end_date: challengeData.endDate,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async joinChallenge(studentId, challengeId) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        student_id: studentId,
        progress: 0,
        completed: false
      })
      .select('*, challenges(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async updateChallengeProgress(studentId, challengeId, progress) {
    const { data: challenge } = await supabase
      .from('challenges')
      .select('target_value, reward_xp')
      .eq('id', challengeId)
      .single();

    const completed = progress >= challenge.target_value;

    const { data, error } = await supabase
      .from('challenge_participants')
      .update({
        progress,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('student_id', studentId)
      .eq('challenge_id', challengeId)
      .select()
      .single();

    if (error) throw error;

    // Award XP if completed
    if (completed) {
      await supabase.rpc('add_student_xp', {
        p_student_id: studentId,
        p_xp_amount: challenge.reward_xp
      });
    }

    return data;
  }

  // Study Plan Management
  async getStudyPlan(studentId) {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*, study_plan_items(*)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async generateStudyPlan(studentId, centerId) {
    // Get student analytics
    const { data: analytics } = await supabase
      .from('student_analytics')
      .select('*')
      .eq('student_id', studentId)
      .single();

    // Get weak subjects
    const { data: performance } = await supabase
      .from('test_attempts')
      .select('subject, score')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20);

    const subjectScores = {};
    performance?.forEach(p => {
      if (!subjectScores[p.subject]) subjectScores[p.subject] = [];
      subjectScores[p.subject].push(p.score);
    });

    const weakSubjects = Object.entries(subjectScores)
      .map(([subject, scores]) => ({
        subject,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .filter(s => s.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    // Create study plan
    const { data: plan, error } = await supabase
      .from('study_plans')
      .insert({
        student_id: studentId,
        center_id: centerId,
        title: 'Personalized Study Plan',
        description: 'AI-generated plan based on your performance',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // Add study items
    const items = weakSubjects.map((ws, idx) => ({
      plan_id: plan.id,
      title: `Improve ${ws.subject}`,
      description: `Focus on ${ws.subject} - Current avg: ${ws.avgScore.toFixed(1)}%`,
      item_type: 'practice',
      target_value: 10,
      order_index: idx,
      status: 'pending'
    }));

    await supabase.from('study_plan_items').insert(items);

    return this.getStudyPlan(studentId);
  }

  async updateStudyPlanItem(itemId, updates) {
    const { data, error } = await supabase
      .from('study_plan_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new GamificationService();
