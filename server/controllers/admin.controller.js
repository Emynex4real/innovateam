const supabase = require('../supabaseClient');
const {
  sanitizeSearchTerm,
  validateUUID,
  validateArray
} = require('../utils/comprehensiveValidator');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    // Enhance users with transaction stats
    const Transaction = require('../models/Transaction');
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const userTransactions = await Transaction.findByUserId(user.id);
          const stats = await Transaction.getUserStats(user.id);
          
          return {
            ...user,
            transactionCount: userTransactions.length,
            totalSpent: stats.totalDebits,
            lastTransaction: userTransactions[0]?.createdAt || null
          };
        } catch {
          return {
            ...user,
            transactionCount: 0,
            totalSpent: 0,
            lastTransaction: null
          };
        }
      })
    );
    
    res.json({ success: true, users: enhancedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:id - get user details
exports.getUserById = async (req, res) => {
  try {
    const validId = validateUUID(req.params.id, 'User ID');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', validId)
      .is('deleted_at', null)
      .single();
    if (error || !user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/activate
exports.activateUser = async (req, res) => {
  try {
    const validId = validateUUID(req.params.id, 'User ID');
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', validId)
      .select();
    if (error) throw error;
    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/deactivate
exports.deactivateUser = async (req, res) => {
  try {
    const validId = validateUUID(req.params.id, 'User ID');
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'inactive' })
      .eq('id', validId)
      .select();
    if (error) throw error;
    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id (Soft Delete)
const { logActivity } = require('../utils/activityLogger');
exports.deleteUser = async (req, res) => {
  try {
    const validId = validateUUID(req.params.id, 'User ID');
    const { data, error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', validId)
      .select();
    if (error) throw error;
    // Log activity
    await logActivity(req.user?.id, 'delete_user', { targetUserId: validId });
    // Send email notification if email exists
    try {
      const { sendEmail } = require('../utils/email');
      if (data && data[0] && data[0].email) {
        await sendEmail({
          to: data[0].email,
          subject: 'Your account has been deactivated',
          text: 'Your account was deactivated by an administrator. If you believe this is a mistake, please contact support.'
        });
      }
    } catch (emailErr) {
      console.error('Failed to send deletion email:', emailErr.message);
    }
    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:id/transactions - get all transactions for a user
exports.getUserTransactions = async (req, res) => {
  try {
    const validId = validateUUID(req.params.id, 'User ID');
    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.findByUserId(validId);
    
    // Get user info for context
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', validId)
      .single();
    
    const enhancedTransactions = transactions.map(tx => ({
      ...tx,
      user: user || { name: 'Unknown User', email: 'N/A' }
    }));
    
    res.json({ success: true, data: enhancedTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/transactions
exports.getTransactions = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.getAll();
    
    // Enhance transactions with user data
    const enhancedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        try {
          const { data: user } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', tx.userId)
            .single();
          
          return {
            ...tx,
            user: user || { name: 'Unknown User', email: 'N/A' }
          };
        } catch {
          return {
            ...tx,
            user: { name: 'Unknown User', email: 'N/A' }
          };
        }
      })
    );
    
    res.json({ success: true, data: enhancedTransactions, transactions: enhancedTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/transactions
exports.createTransaction = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const transaction = await Transaction.create(req.body);
    
    // Get user info for the response
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', transaction.userId)
      .single();
    
    const enhancedTransaction = {
      ...transaction,
      user: user || { name: 'Unknown User', email: 'N/A' }
    };
    
    res.status(201).json({ success: true, transaction: enhancedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const { id } = req.params;
    
    const updatedTransaction = await Transaction.update(id, req.body);
    
    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const { id } = req.params;
    
    const deleted = await Transaction.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    // Log activity if logger is available
    try {
      const { logActivity } = require('../utils/activityLogger');
      await logActivity(req.user?.id, 'delete_transaction', { transactionId: id });
    } catch (logError) {
      console.log('Activity logging failed:', logError.message);
    }
    
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// TUTORIAL CENTERS MANAGEMENT
// ============================================

// GET /api/admin/tutorial-centers - Get all centers with analytics
exports.getTutorialCenters = async (req, res) => {
  try {
    const { data: centers, error } = await supabase
      .from('tutorial_centers')
      .select(`
        *,
        tutor:user_profiles!tutorial_centers_tutor_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get analytics for each center
    const centersWithStats = await Promise.all(
      centers.map(async (center) => {
        const [students, questions, tests, attempts] = await Promise.all([
          supabase.from('tc_enrollments').select('id', { count: 'exact', head: true }).eq('center_id', center.id),
          supabase.from('tc_questions').select('id', { count: 'exact', head: true }).eq('center_id', center.id),
          supabase.from('tc_question_sets').select('id', { count: 'exact', head: true }).eq('center_id', center.id),
          supabase.from('tc_student_attempts').select('id, score', { count: 'exact' }).in('question_set_id', 
            (await supabase.from('tc_question_sets').select('id').eq('center_id', center.id)).data?.map(t => t.id) || []
          )
        ]);

        const avgScore = attempts.data?.length 
          ? Math.round(attempts.data.reduce((sum, a) => sum + a.score, 0) / attempts.data.length)
          : 0;

        return {
          ...center,
          stats: {
            students: students.count || 0,
            questions: questions.count || 0,
            tests: tests.count || 0,
            attempts: attempts.count || 0,
            avgScore
          }
        };
      })
    );
    
    res.json({ success: true, centers: centersWithStats });
  } catch (error) {
    console.error('Get tutorial centers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/tutorial-centers/:id - Get center details with full analytics
exports.getTutorialCenterDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get center with tutor info
    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select(`
        *,
        tutor:user_profiles!tutorial_centers_tutor_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (centerError) throw centerError;
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    // Get all tests for this center
    const { data: tests } = await supabase
      .from('tc_question_sets')
      .select('id')
      .eq('center_id', id);
    const testIds = tests?.map(t => t.id) || [];

    // Parallel fetch all analytics
    const [
      enrollments,
      questions,
      questionSets,
      attempts,
      recentActivity
    ] = await Promise.all([
      // Students with their stats
      supabase.from('tc_enrollments')
        .select(`
          *,
          student:user_profiles!tc_enrollments_student_id_fkey(id, full_name, email)
        `)
        .eq('center_id', id),
      
      // Questions count
      supabase.from('tc_questions')
        .select('id, subject', { count: 'exact' })
        .eq('center_id', id),
      
      // Tests with stats
      supabase.from('tc_question_sets')
        .select(`
          *,
          question_count:tc_question_set_items(count)
        `)
        .eq('center_id', id),
      
      // All attempts
      supabase.from('tc_student_attempts')
        .select('*')
        .in('question_set_id', testIds),
      
      // Recent activity (last 30 days)
      supabase.from('tc_student_attempts')
        .select('student_id, completed_at')
        .in('question_set_id', testIds)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Calculate student stats
    const studentsWithStats = enrollments.data?.map(enrollment => {
      const studentAttempts = attempts.data?.filter(a => a.student_id === enrollment.student_id) || [];
      const avgScore = studentAttempts.length
        ? Math.round(studentAttempts.reduce((sum, a) => sum + a.score, 0) / studentAttempts.length)
        : 0;
      const lastActivity = studentAttempts.length
        ? new Date(Math.max(...studentAttempts.map(a => new Date(a.completed_at))))
        : null;

      return {
        ...enrollment.student,
        enrolled_at: enrollment.enrolled_at,
        tests_taken: studentAttempts.length,
        avg_score: avgScore,
        last_activity: lastActivity
      };
    }) || [];

    // Calculate test stats
    const testsWithStats = questionSets.data?.map(test => {
      const testAttempts = attempts.data?.filter(a => a.question_set_id === test.id) || [];
      const avgScore = testAttempts.length
        ? Math.round(testAttempts.reduce((sum, a) => sum + a.score, 0) / testAttempts.length)
        : 0;
      const passRate = testAttempts.length
        ? Math.round((testAttempts.filter(a => a.score >= test.passing_score).length / testAttempts.length) * 100)
        : 0;

      return {
        ...test,
        total_attempts: testAttempts.length,
        avg_score: avgScore,
        pass_rate: passRate
      };
    }) || [];

    // Calculate engagement metrics
    const activeStudents = new Set(recentActivity.data?.map(a => a.student_id)).size;
    const totalAttempts = attempts.data?.length || 0;
    const avgScore = totalAttempts
      ? Math.round(attempts.data.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;

    // Subject distribution
    const subjectCounts = {};
    questions.data?.forEach(q => {
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    });

    const analytics = {
      overview: {
        total_students: enrollments.data?.length || 0,
        active_students: activeStudents,
        total_questions: questions.count || 0,
        total_tests: questionSets.data?.length || 0,
        total_attempts: totalAttempts,
        avg_score: avgScore
      },
      students: studentsWithStats,
      tests: testsWithStats,
      subjects: Object.entries(subjectCounts).map(([subject, count]) => ({ subject, count })),
      engagement: {
        dau: activeStudents,
        retention_rate: enrollments.data?.length ? Math.round((activeStudents / enrollments.data.length) * 100) : 0
      }
    };

    res.json({ success: true, center, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/admin/tutorial-centers/:id/suspend - Suspend a center
exports.suspendTutorialCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('tutorial_centers')
      .update({ 
        is_suspended: true,
        suspension_reason: reason || 'Suspended by admin',
        suspended_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, center: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/admin/tutorial-centers/:id/activate - Activate a center
exports.activateTutorialCenter = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tutorial_centers')
      .update({ 
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, center: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/admin/tutorial-centers/:id - Delete a center
exports.deleteTutorialCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('tutorial_centers')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: req.user.id,
        deletion_reason: reason || 'Deleted by admin'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Center deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
