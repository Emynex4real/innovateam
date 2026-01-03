import axios from 'axios';
import supabase from '../config/supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const USE_SUPABASE_DIRECT = true; // Always use Supabase direct for now

const getAuthHeaders = async () => {
  try {
    // Get Supabase session token
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Failed to get session:', error);
      return { 'Content-Type': 'application/json' };
    }
    
    const token = session?.access_token;
    
    if (!token) {
      console.warn('No access token found in session');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return { 'Content-Type': 'application/json' };
  }
};

export class AIQuestionsService {
  static async generateQuestions(data) {
    const headers = await getAuthHeaders();
    console.log('Sending request with headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer [PRESENT]' : 'MISSING' });
    const response = await axios.post(`${API_BASE_URL}/api/admin/ai-questions/generate`, data, { headers });
    return response.data;
  }

  static async getQuestionBanks() {
    try {
      if (USE_SUPABASE_DIRECT) {
        // Get banks with question count
        const { data: banks, error } = await supabase
          .from('question_banks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase error fetching banks:', error);
          throw error;
        }
        
        // Get question counts for each bank
        const banksWithCounts = await Promise.all(
          (banks || []).map(async (bank) => {
            const { count } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('bank_id', bank.id);
            
            // Get creator name
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name')
              .eq('id', bank.created_by)
              .single();
            
            return {
              ...bank,
              questionCount: count || 0,
              creatorName: profile?.full_name || 'Admin'
            };
          })
        );
        
        return { success: true, data: banksWithCounts };
      }
      const headers = await getAuthHeaders();
      console.log('Fetching question banks from API...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/ai-questions/banks`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error in getQuestionBanks:', error.response?.data || error.message);
      throw error;
    }
  }

  static async getQuestionsByBank(bankId) {
    if (USE_SUPABASE_DIRECT) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('bank_id', bankId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    }
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/admin/ai-questions/banks/${bankId}/questions`, { headers });
    return response.data;
  }

  static async updateQuestion(id, data) {
    if (USE_SUPABASE_DIRECT) {
      const { error } = await supabase
        .from('questions')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_BASE_URL}/api/admin/ai-questions/questions/${id}`, data, { headers });
    return response.data;
  }

  static async deleteQuestion(id) {
    if (USE_SUPABASE_DIRECT) {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}/api/admin/ai-questions/questions/${id}`, { headers });
    return response.data;
  }

  static async deleteQuestionBank(id) {
    if (USE_SUPABASE_DIRECT) {
      const { error } = await supabase
        .from('question_banks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}/api/admin/ai-questions/banks/${id}`, { headers });
    return response.data;
  }

  static async bulkDeleteQuestions(questionIds) {
    if (USE_SUPABASE_DIRECT) {
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', questionIds);
      if (error) throw error;
      return { success: true };
    }
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/admin/ai-questions/questions/bulk-delete`, { questionIds }, { headers });
    return response.data;
  }

  static async toggleQuestionStatus(id) {
    if (USE_SUPABASE_DIRECT) {
      const { data: question } = await supabase
        .from('questions')
        .select('is_active')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('questions')
        .update({ is_active: !question.is_active })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_BASE_URL}/api/admin/ai-questions/questions/${id}/toggle`, {}, { headers });
    return response.data;
  }

  static async getQuestionStats() {
    if (USE_SUPABASE_DIRECT) {
      const [banksResult, questionsResult] = await Promise.all([
        supabase.from('question_banks').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id', { count: 'exact', head: true })
      ]);
      
      return {
        success: true,
        data: {
          totalBanks: banksResult.count || 0,
          totalQuestions: questionsResult.count || 0,
          totalUsage: 0,
          correctAnswers: 0
        }
      };
    }
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/admin/ai-questions/stats`, { headers });
    return response.data;
  }
}

export default AIQuestionsService;
