const supabase = require('../supabaseClient');

// Log proctoring session and violations
exports.logSession = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🛡️ [PROCTORING] Log session request received');
    console.log('='.repeat(80));
    console.log('Timestamp:', new Date().toISOString());
    console.log('User ID:', req.user?.id);
    console.log('User Email:', req.user?.email);
    
    const { attempt_id, test_id, device_fingerprint, violations } = req.body;
    const student_id = req.user.id;

    console.log('\n📊 Request Data:');
    console.log('- Attempt ID:', attempt_id);
    console.log('- Test ID:', test_id);
    console.log('- Student ID:', student_id);
    console.log('- Violations count:', violations?.length || 0);
    console.log('- Device fingerprint:', device_fingerprint ? 'present' : 'missing');

    // Verify required fields
    if (!attempt_id || !test_id || !student_id) {
      console.error('\n❌ Missing required fields:');
      console.error('- attempt_id:', attempt_id ? '✓' : '✗');
      console.error('- test_id:', test_id ? '✓' : '✗');
      console.error('- student_id:', student_id ? '✓' : '✗');
      console.log('='.repeat(80) + '\n');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        missing: { attempt_id: !attempt_id, test_id: !test_id, student_id: !student_id }
      });
    }

    console.log('\n🔄 Creating proctoring session...');
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('proctoring_sessions')
      .insert({
        attempt_id,
        student_id,
        test_id,
        device_fingerprint: device_fingerprint || {},
        session_start: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('\n❌ Session insert error:');
      console.error('Code:', sessionError.code);
      console.error('Message:', sessionError.message);
      console.error('Details:', sessionError.details);
      console.error('Hint:', sessionError.hint);
      console.log('='.repeat(80) + '\n');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create session',
        error: sessionError.message,
        details: sessionError
      });
    }

    console.log('\n✅ Session created successfully');
    console.log('Session ID:', session.id);
    console.log('Session data:', JSON.stringify(session, null, 2));

    // Insert violations if any
    if (violations && violations.length > 0) {
      console.log('\n📋 Processing', violations.length, 'violations...');
      
      const violationRecords = violations.map((v, i) => {
        console.log(`  ${i+1}. Type: ${v.type}, Timestamp: ${v.timestamp}`);
        return {
          session_id: session.id,
          violation_type: v.type,
          timestamp: v.timestamp || new Date().toISOString(),
          metadata: v.metadata || {},
          severity: getSeverity(v.type)
        };
      });

      console.log('\n🔄 Inserting violations...');
      const { error: violationsError } = await supabase
        .from('proctoring_violations')
        .insert(violationRecords);

      if (violationsError) {
        console.error('\n❌ Violations insert error:');
        console.error('Code:', violationsError.code);
        console.error('Message:', violationsError.message);
        console.log('='.repeat(80) + '\n');
        return res.json({ 
          success: true, 
          session_id: session.id,
          warning: 'Session created but violations failed',
          violations_error: violationsError.message
        });
      }

      console.log('✅ Violations inserted successfully');
    } else {
      console.log('\nℹ️  No violations to insert');
    }

    console.log('\n🎉 Proctoring session logged successfully');
    console.log('='.repeat(80) + '\n');
    res.json({ success: true, session_id: session.id });
  } catch (error) {
    console.error('\n❌ Fatal error in logSession:');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.log('='.repeat(80) + '\n');
    res.status(500).json({ success: false, message: 'Failed to log session', error: error.message });
  }
};

// End session
exports.endSession = async (req, res) => {
  try {
    const { session_id } = req.body;

    const { error } = await supabase
      .from('proctoring_sessions')
      .update({ session_end: new Date().toISOString() })
      .eq('id', session_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ success: false, message: 'Failed to end session' });
  }
};

// Get proctoring report for tutor
exports.getReport = async (req, res) => {
  try {
    const { attempt_id } = req.params;
    const tutor_id = req.user.id;

    // Get session
    const { data: session } = await supabase
      .from('proctoring_sessions')
      .select('*')
      .eq('attempt_id', attempt_id)
      .single();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Get tutor's center
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutor_id)
      .single();

    if (!center) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Verify test belongs to tutor's center
    const { data: test } = await supabase
      .from('tc_question_sets')
      .select('center_id')
      .eq('id', session.test_id)
      .single();

    if (!test || test.center_id !== center.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get violations
    const { data: violations } = await supabase
      .from('proctoring_violations')
      .select('*')
      .eq('session_id', session.id)
      .order('timestamp', { ascending: true });

    res.json({
      success: true,
      session,
      violations: violations || []
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

// Get all proctoring reports for a center
exports.getCenterReports = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📊 [PROCTORING-DASHBOARD] Get center reports request');
    console.log('='.repeat(80));
    console.log('Timestamp:', new Date().toISOString());
    console.log('User ID:', req.user?.id);
    console.log('User Email:', req.user?.email);
    
    const tutor_id = req.user.id;
    const { risk_level, test_id } = req.query;

    console.log('\n🔍 Query params:');
    console.log('- Risk level filter:', risk_level || 'none');
    console.log('- Test ID filter:', test_id || 'none');

    // Get tutor's center
    console.log('\n🔄 Fetching tutor center...');
    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutor_id)
      .single();

    if (centerError && centerError.code !== 'PGRST116') {
      console.error('\n❌ Center query error:', centerError);
      console.log('='.repeat(80) + '\n');
      return res.status(500).json({ success: false, message: 'Failed to fetch center' });
    }

    console.log('✅ Center query complete');
    console.log('Center ID:', center?.id || 'none');

    if (!center?.id) {
      console.log('\n⚠️  Tutor has no center - returning empty');
      console.log('='.repeat(80) + '\n');
      return res.status(403).json({ success: false, message: 'No center access' });
    }

    // Build query - get sessions for tests in this center
    console.log('\n🔄 Step 1: Get all tests for this center...');
    const { data: tests, error: testsError } = await supabase
      .from('tc_question_sets')
      .select('id, title')
      .eq('center_id', center.id);
    
    if (testsError) {
      console.error('❌ Tests query error:', testsError);
      throw testsError;
    }
    
    const testIds = tests?.map(t => t.id) || [];
    console.log('✅ Found', testIds.length, 'tests in center');
    
    if (testIds.length === 0) {
      console.log('⚠️  No tests in center - returning empty');
      console.log('='.repeat(80) + '\n');
      return res.json({ success: true, reports: [] });
    }
    
    console.log('\n🔄 Step 2: Query proctoring sessions for these tests...');
    let query = supabase
      .from('proctoring_sessions')
      .select('*')
      .in('test_id', testIds)
      .order('session_start', { ascending: false });

    console.log('Query filters:');
    console.log('- test_id IN:', testIds.slice(0, 5), '... (showing first 5)');
    console.log('- Order by: session_start DESC');
    
    if (risk_level) {
      query = query.eq('risk_level', risk_level);
      console.log('- risk_level:', risk_level);
    }
    if (test_id) {
      query = query.eq('test_id', test_id);
      console.log('- test_id:', test_id);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('\n❌ Query error:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.log('='.repeat(80) + '\n');
      throw error;
    }

    console.log('\n✅ Query successful');
    console.log('Total sessions found:', sessions?.length || 0);
    
    // Get violation counts and enrich data
    const reports = [];
    if (sessions && sessions.length > 0) {
      console.log('\n🔄 Step 3: Processing sessions and fetching violations...');
      
      for (const session of sessions) {
        // Get violations
        const { data: violations } = await supabase
          .from('proctoring_violations')
          .select('violation_type, severity')
          .eq('session_id', session.id);
        
        // Get test title
        const test = tests.find(t => t.id === session.test_id);
        
        // Get attempt details
        const { data: attempt } = await supabase
          .from('tc_student_attempts')
          .select('score')
          .eq('id', session.attempt_id)
          .single();
        
        // Get student email from auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(session.student_id);
        
        // Count violations by type
        const tabSwitches = violations?.filter(v => v.violation_type === 'TAB_SWITCH').length || 0;
        const copyAttempts = violations?.filter(v => v.violation_type === 'COPY_ATTEMPT').length || 0;
        const focusLosses = violations?.filter(v => v.violation_type === 'FOCUS_LOSS').length || 0;
        
        reports.push({
          id: session.id,
          attempt_id: session.attempt_id,
          student_id: session.student_id,
          student_name: userData?.user?.user_metadata?.name || userData?.user?.email?.split('@')[0] || 'Unknown',
          student_email: userData?.user?.email || 'unknown@email.com',
          test_id: session.test_id,
          test_title: test?.title || 'Unknown Test',
          test_score: attempt?.score || 0,
          test_passed: (attempt?.score || 0) >= 50,
          session_start: session.session_start,
          session_end: session.session_end,
          risk_score: session.risk_score || 0,
          risk_level: session.risk_level || 'LOW',
          total_violations: violations?.length || 0,
          tab_switches: tabSwitches,
          copy_attempts: copyAttempts,
          focus_losses: focusLosses,
          violations: violations || [],
          device_fingerprint: session.device_fingerprint
        });
      }
      
      console.log('✅ Processed', reports.length, 'sessions');
      if (reports.length > 0) {
        console.log('\n📊 Sample reports:');
        reports.slice(0, 3).forEach((r, i) => {
          console.log(`  ${i+1}. Test: ${r.test_title}, Violations: ${r.total_violations}, Risk: ${r.risk_score}`);
        });
      }
    } else {
      console.log('⚠️  No proctoring sessions found');
      console.log('\nPossible reasons:');
      console.log('1. No students have taken tests yet');
      console.log('2. Proctoring sessions not being logged');
      console.log('3. Check if proctoring is enabled on test submission');
    }

    console.log('\n📦 Returning', reports.length, 'reports');
    console.log('='.repeat(80) + '\n');

    res.json({ success: true, reports });
  } catch (error) {
    console.error('\n❌ Fatal error in getCenterReports:');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.log('='.repeat(80) + '\n');
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// Get student's own proctoring data
exports.getMySession = async (req, res) => {
  try {
    const { attempt_id } = req.params;
    const student_id = req.user.id;

    const { data: session } = await supabase
      .from('proctoring_sessions')
      .select('risk_score, risk_level, total_violations')
      .eq('attempt_id', attempt_id)
      .eq('student_id', student_id)
      .single();

    if (!session) {
      return res.json({ success: true, session: null });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Get my session error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
};

// Helper: Determine severity based on violation type
function getSeverity(type) {
  const severityMap = {
    'TAB_SWITCH': 4,
    'COPY_ATTEMPT': 5,
    'FOCUS_LOSS': 3,
    'RIGHT_CLICK': 2,
    'FULLSCREEN_EXIT': 4,
    'PASTE_ATTEMPT': 5,
    'DEVTOOLS_OPEN': 5,
    'KEYBOARD_SHORTCUT': 3
  };
  return severityMap[type] || 1;
}

module.exports = exports;
