import supabase from '../config/supabase';
import { calculateQuality, sortQuestionsByPriority } from '../utils/spacedRepetition';

class MasteryService {
  async saveMastery(questionId, isCorrect, timeSpent = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const quality = calculateQuality(isCorrect, timeSpent, 30);

      const { error } = await supabase.rpc('update_question_mastery', {
        p_student_id: user.id,
        p_question_id: questionId,
        p_is_correct: isCorrect,
        p_quality_score: quality
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Save mastery error:', error);
      return { success: false, error: error.message };
    }
  }

  async getDueQuestions(bankId, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: questions, error: qError } = await supabase
        .from('ai_questions')
        .select('*')
        .eq('bank_id', bankId)
        .eq('is_active', true);

      if (qError) throw qError;

      const { data: mastery, error: mError } = await supabase
        .from('student_question_mastery')
        .select('*')
        .eq('student_id', user.id);

      if (mError) throw mError;

      const masteryMap = {};
      (mastery || []).forEach(m => {
        masteryMap[m.question_id] = m;
      });

      const sorted = sortQuestionsByPriority(questions || [], masteryMap);
      return { success: true, data: sorted.slice(0, limit) };
    } catch (error) {
      console.error('Get due questions error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getMasteryStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('student_question_mastery')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        mastered: data?.filter(m => m.mastery_level >= 5).length || 0,
        learning: data?.filter(m => m.mastery_level >= 1 && m.mastery_level < 5).length || 0,
        dueToday: data?.filter(m => m.next_review_date && new Date(m.next_review_date) <= new Date()).length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Get mastery stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new MasteryService();
