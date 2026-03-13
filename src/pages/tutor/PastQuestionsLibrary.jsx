import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pastQuestionsService from "../../services/pastQuestions.service";
import toast from "react-hot-toast";
import { useDarkMode } from "../../contexts/DarkModeContext";
import MathText from "../../components/MathText";
import {
  ArrowLeft,
  Search,
  Download,
  BookOpen,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Loader,
  Library,
  GraduationCap,
  Calendar,
  BarChart3,
  Award,
} from "lucide-react";

const examBodies = [
  { id: "all", label: "All Exams", emoji: "📚" },
  { id: "jamb", label: "JAMB", emoji: "🎓" },
  { id: "waec", label: "WAEC", emoji: "📝" },
  { id: "neco", label: "NECO", emoji: "📋" },
];

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const PastQuestionsLibrary = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  // Filters
  const [examBody, setExamBody] = useState("all");
  const [examYear, setExamYear] = useState("");
  const [subject, setSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // Data
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // UI
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load filters when exam body changes
  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examBody]);

  // Load questions when filters change
  useEffect(() => {
    setPage(1);
    loadQuestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examBody, examYear, subject, difficulty, searchTerm]);

  const loadStats = async () => {
    try {
      const res = await pastQuestionsService.getStats();
      if (res.success) setStats(res.stats);
    } catch {}
  };

  const loadFilters = async () => {
    try {
      const body = examBody === "all" ? null : examBody;
      const [subRes, yearRes] = await Promise.all([
        pastQuestionsService.getSubjects(body),
        pastQuestionsService.getYears(body),
      ]);
      if (subRes.success) setSubjects(subRes.subjects);
      if (yearRes.success) setYears(yearRes.years);
    } catch {}
  };

  const loadQuestions = async (p = page) => {
    setLoading(true);
    try {
      const filters = { page: p, limit: 20 };
      if (examBody !== "all") filters.exam_body = examBody;
      if (examYear) filters.exam_year = examYear;
      if (subject) filters.subject = subject;
      if (difficulty) filters.difficulty = difficulty;
      if (searchTerm) filters.search = searchTerm;

      const res = await pastQuestionsService.getQuestions(filters);
      if (res.success) {
        setQuestions(res.questions);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        setPage(p);
      }
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    const allIds = questions.map((q) => q.id);
    const allSelected = allIds.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleImport = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one question");
      return;
    }
    setImporting(true);
    try {
      const res = await pastQuestionsService.importToBank(selected);
      if (res.success) {
        toast.success(`${res.imported} questions imported to your bank!`);
        setSelected([]);
      }
    } catch (e) {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => navigate("/tutor/questions")}
            className={`flex items-center gap-2 text-sm font-medium w-fit transition-colors ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ArrowLeft size={16} /> Back to Question Bank
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Library className="text-blue-500" size={28} />
                Past Questions Library
              </h1>
              <p
                className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Browse verified exam questions and import them to your bank
              </p>
            </div>

            {/* Import Button */}
            {selected.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition disabled:opacity-50"
              >
                <Download size={18} />
                {importing
                  ? "Importing..."
                  : `Import ${selected.length} to My Bank`}
              </button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={BookOpen}
                label="Total Questions"
                value={stats.total}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon={GraduationCap}
                label="JAMB"
                value={stats.byExamBody?.jamb || 0}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon={Calendar}
                label="WAEC"
                value={stats.byExamBody?.waec || 0}
                isDarkMode={isDarkMode}
              />
              <StatCard
                icon={BarChart3}
                label="Subjects"
                value={Object.keys(stats.bySubject || {}).length}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* ICAN Banner */}
          <div
            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
              isDarkMode
                ? "bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-800/50 hover:border-indigo-700"
                : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-300"
            }`}
            onClick={() => navigate("/tutor/ican-past-questions")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ICAN Professional Exam Questions</h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Browse Foundation, Skills & Professional level past papers for tutorial centers
                  </p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                Browse ICAN →
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`p-4 rounded-2xl border mb-6 space-y-4 ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
        >
          {/* Exam Body Tabs */}
          <div
            className={`flex p-1 rounded-xl ${isDarkMode ? "bg-gray-950 border border-gray-800" : "bg-gray-100"}`}
          >
            {examBodies.map((eb) => (
              <button
                key={eb.id}
                onClick={() => {
                  setExamBody(eb.id);
                  setSubject("");
                  setExamYear("");
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  examBody === eb.id
                    ? "bg-white text-green-600 shadow-sm dark:bg-gray-800 dark:text-green-400"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {eb.emoji} {eb.label}
              </button>
            ))}
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>

            {/* Subject */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.subject} value={s.subject}>
                  {s.subject} ({s.count})
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Select All + Count */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={selectAll}
            className={`flex items-center gap-2 text-sm font-medium transition ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            {questions.length > 0 &&
            questions.every((q) => selected.includes(q.id)) ? (
              <CheckSquare size={16} className="text-green-500" />
            ) : (
              <Square size={16} />
            )}
            Select All on Page
          </button>
          <span className="text-sm text-gray-500">
            {total} question{total !== 1 ? "s" : ""} found
            {selected.length > 0 && (
              <span className="text-green-600 font-bold ml-2">
                ({selected.length} selected)
              </span>
            )}
          </span>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-green-600" size={32} />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen
              size={48}
              className={isDarkMode ? "text-gray-700" : "text-gray-300"}
            />
            <h3 className="text-lg font-semibold mt-4">No questions found</h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const isSelected = selected.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10 dark:border-green-600 shadow-sm"
                      : isDarkMode
                        ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="pt-1 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "bg-green-600 border-green-600" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {isSelected && (
                          <CheckSquare size={14} className="text-white" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-medium leading-relaxed">
                          <MathText text={q.question_text} />
                        </p>
                      </div>

                      {/* Options Preview */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {(q.options || []).map((opt, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-3 py-1.5 rounded-lg ${
                              ["A", "B", "C", "D"][idx] === q.correct_answer
                                ? "bg-green-100 text-green-700 font-bold dark:bg-green-900/30 dark:text-green-300"
                                : isDarkMode
                                  ? "bg-gray-800 text-gray-400"
                                  : "bg-gray-50 text-gray-600"
                            }`}
                          >
                            <span className="font-bold mr-1">
                              {["A", "B", "C", "D"][idx]}.
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold uppercase dark:bg-blue-900/30 dark:text-blue-300">
                          {q.exam_body}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}
                        >
                          {q.exam_year}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}
                        >
                          {q.subject}
                        </span>
                        {q.topic && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}
                          >
                            {q.topic}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded capitalize ${difficultyColors[q.difficulty] || ""}`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => loadQuestions(page - 1)}
              disabled={page <= 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-gray-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => loadQuestions(page + 1)}
              disabled={page >= totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Sub-component
const StatCard = ({ icon: Icon, label, value, isDarkMode }) => (
  <div
    className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
      >
        <Icon size={18} className="text-green-500" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

export default PastQuestionsLibrary;
