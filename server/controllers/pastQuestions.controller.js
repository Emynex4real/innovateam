const supabase = require("../supabaseClient");
const { logger } = require("../utils/logger");

// Browse past questions with filters + pagination
exports.getPastQuestions = async (req, res) => {
  try {
    const {
      exam_body,
      exam_year,
      subject,
      topic,
      difficulty,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    let query = supabase.from("past_questions").select("*", { count: "exact" });

    if (exam_body) query = query.eq("exam_body", exam_body);
    if (exam_year) query = query.eq("exam_year", parseInt(exam_year));
    if (subject) query = query.eq("subject", subject);
    if (topic) query = query.ilike("topic", `%${topic}%`);
    if (difficulty) query = query.eq("difficulty", difficulty);
    if (search) query = query.ilike("question_text", `%${search}%`);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query
      .order("exam_year", { ascending: false })
      .order("subject")
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      questions: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    logger.error("Get past questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get distinct subjects per exam body
exports.getSubjects = async (req, res) => {
  try {
    const { exam_body } = req.query;

    let query = supabase.from("past_questions").select("subject, exam_body");

    if (exam_body) query = query.eq("exam_body", exam_body);

    const { data, error } = await query;
    if (error) throw error;

    // Get unique subjects with counts
    const subjectMap = {};
    data.forEach((row) => {
      const key = row.subject;
      if (!subjectMap[key]) subjectMap[key] = { subject: key, count: 0 };
      subjectMap[key].count++;
    });

    res.json({
      success: true,
      subjects: Object.values(subjectMap).sort((a, b) =>
        a.subject.localeCompare(b.subject),
      ),
    });
  } catch (error) {
    logger.error("Get past question subjects error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get distinct years per exam body
exports.getYears = async (req, res) => {
  try {
    const { exam_body } = req.query;

    let query = supabase.from("past_questions").select("exam_year, exam_body");

    if (exam_body) query = query.eq("exam_body", exam_body);

    const { data, error } = await query;
    if (error) throw error;

    const yearSet = [...new Set(data.map((r) => r.exam_year))].sort(
      (a, b) => b - a,
    );

    res.json({ success: true, years: yearSet });
  } catch (error) {
    logger.error("Get past question years error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Import selected past questions into tutor's tc_questions bank
exports.importToBank = async (req, res) => {
  try {
    const { question_ids } = req.body;
    const tutorId = req.user.id;

    if (!question_ids || question_ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No questions selected" });
    }

    // Get tutor's center
    const { data: center } = await supabase
      .from("tutorial_centers")
      .select("id")
      .eq("tutor_id", tutorId)
      .single();

    if (!center) {
      return res
        .status(404)
        .json({ success: false, error: "Create a tutorial center first" });
    }

    // Fetch the past questions
    const { data: pastQuestions, error: fetchError } = await supabase
      .from("past_questions")
      .select("*")
      .in("id", question_ids);

    if (fetchError) throw fetchError;

    if (!pastQuestions || pastQuestions.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No questions found" });
    }

    // Map to tc_questions format
    const newQuestions = pastQuestions.map((pq) => ({
      tutor_id: tutorId,
      center_id: center.id,
      question_text: pq.question_text,
      options: pq.options,
      correct_answer: pq.correct_answer,
      explanation: pq.explanation,
      subject: pq.subject,
      topic: pq.topic || `${pq.exam_body.toUpperCase()} ${pq.exam_year}`,
      difficulty: pq.difficulty,
      category: `past_question_${pq.exam_body}`,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("tc_questions")
      .insert(newQuestions)
      .select();

    if (insertError) throw insertError;

    logger.info("Past questions imported", {
      tutorId,
      count: inserted.length,
    });

    res.json({
      success: true,
      imported: inserted.length,
      message: `${inserted.length} questions imported to your bank`,
    });
  } catch (error) {
    logger.error("Import past questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin: Bulk seed past questions
exports.seedQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No questions provided" });
    }

    const { data, error } = await supabase
      .from("past_questions")
      .insert(questions)
      .select();

    if (error) throw error;

    logger.info("Past questions seeded", { count: data.length });
    res.json({ success: true, seeded: data.length });
  } catch (error) {
    logger.error("Seed past questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get stats overview
exports.getStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("past_questions")
      .select("exam_body, exam_year, subject");

    if (error) throw error;

    const stats = {
      total: data.length,
      byExamBody: {},
      bySubject: {},
    };

    data.forEach((q) => {
      stats.byExamBody[q.exam_body] = (stats.byExamBody[q.exam_body] || 0) + 1;
      stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
    });

    res.json({ success: true, stats });
  } catch (error) {
    logger.error("Get past questions stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
