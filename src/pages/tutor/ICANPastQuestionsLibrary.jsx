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
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader,
  Award,
  Calendar,
  Layers,
  Filter,
  Target,
  Hash,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   ICAN CONSTANTS
   ═══════════════════════════════════════════════════ */

const SKILL_LEVELS = [
  {
    value: "all",
    label: "All Levels",
    emoji: "📚",
    color: "gray",
  },
  {
    value: "foundation",
    label: "Foundation",
    emoji: "🌱",
    color: "emerald",
    description: "Entry-level papers",
  },
  {
    value: "skills",
    label: "Skills",
    emoji: "⚡",
    color: "blue",
    description: "Intermediate competency",
  },
  {
    value: "professional",
    label: "Professional",
    emoji: "👑",
    color: "purple",
    description: "Advanced qualification",
  },
];

const DIET_OPTIONS = [
  { value: "", label: "All Diets" },
  { value: "march", label: "March Diet 🌱" },
  { value: "may", label: "May Diet ☀️" },
  { value: "november", label: "November Diet 🍂" },
];

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const skillLevelColors = {
  foundation:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  skills: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  professional:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

const ICANPastQuestionsLibrary = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  // ─── Filters ───
  const [skillLevel, setSkillLevel] = useState("all");
  const [diet, setDiet] = useState("");
  const [examYear, setExamYear] = useState("");
  const [subject, setSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // ─── Data ───
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState([]);

  // ─── Pagination ───
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ─── UI ───
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [showAnswers, setShowAnswers] = useState(false);

  // ─── Load stats on mount ───
  useEffect(() => {
    loadStats();
  }, []);

  // ─── Load filters when skill level changes ───
  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillLevel]);

  // ─── Load questions when filters change ───
  useEffect(() => {
    setPage(1);
    loadQuestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillLevel, diet, examYear, subject, difficulty, searchTerm]);

  const loadStats = async () => {
    try {
      const res = await pastQuestionsService.getStats();
      if (res.success) setStats(res.stats);
    } catch {}
  };

  const loadFilters = async () => {
    try {
      const [subRes, yearRes] = await Promise.all([
        pastQuestionsService.getSubjects("ican"),
        pastQuestionsService.getYears("ican"),
      ]);
      if (subRes.success) setSubjects(subRes.subjects);
      if (yearRes.success) setYears(yearRes.years);
    } catch {}
  };

  const loadQuestions = async (p = page) => {
    setLoading(true);
    try {
      const filters = {
        page: p,
        limit: 20,
        exam_body: "ican",
      };
      if (skillLevel !== "all") filters.skill_level = skillLevel;
      if (diet) filters.diet = diet;
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
      toast.error("Failed to load ICAN questions");
    } finally {
      setLoading(false);
    }
  };

  // ─── Selection ───
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Import ───
  const handleImport = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one question");
      return;
    }
    setImporting(true);
    try {
      const res = await pastQuestionsService.importToBank(selected);
      if (res.success) {
        toast.success(`${res.imported} ICAN questions imported to your bank!`);
        setSelected([]);
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ─── Clear all filters ───
  const clearFilters = () => {
    setSkillLevel("all");
    setDiet("");
    setExamYear("");
    setSubject("");
    setSearchTerm("");
    setDifficulty("");
  };

  const hasActiveFilters =
    skillLevel !== "all" ||
    diet ||
    examYear ||
    subject ||
    searchTerm ||
    difficulty;

  // ─── ICAN Stats ───
  const icanTotal = stats?.byExamBody?.ican || 0;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => navigate("/tutor/past-questions")}
            className={`flex items-center gap-2 text-sm font-medium w-fit transition-colors ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ArrowLeft size={16} /> Back to Past Questions Library
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Award size={24} />
                </div>
                ICAN Past Questions
              </h1>
              <p
                className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Browse verified ICAN professional exam past papers — import to
                your tutorial center bank
              </p>
            </div>

            {/* Import Button */}
            {selected.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
              >
                <Download size={18} />
                {importing
                  ? "Importing..."
                  : `Import ${selected.length} to My Bank`}
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Hash}
              label="Total ICAN Questions"
              value={icanTotal}
              color="indigo"
              isDarkMode={isDarkMode}
            />
            <StatCard
              icon={Layers}
              label="Papers"
              value={subjects.length}
              color="purple"
              isDarkMode={isDarkMode}
            />
            <StatCard
              icon={Calendar}
              label="Years Available"
              value={years.length}
              color="blue"
              isDarkMode={isDarkMode}
            />
            <StatCard
              icon={Target}
              label="Selected"
              value={selected.length}
              color="emerald"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* ═══ SKILL LEVEL TABS ═══ */}
        <div className="mb-6">
          <div
            className={`p-1.5 rounded-xl inline-flex gap-1 ${isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-gray-100 border border-gray-200"}`}
          >
            {SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  setSkillLevel(level.value);
                  setSubject("");
                }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  skillLevel === level.value
                    ? level.value === "all"
                      ? `shadow-sm ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`
                      : level.value === "foundation"
                        ? `shadow-sm ${isDarkMode ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`
                        : level.value === "skills"
                          ? `shadow-sm ${isDarkMode ? "bg-blue-900/40 text-blue-300 border border-blue-700" : "bg-blue-50 text-blue-700 border border-blue-200"}`
                          : `shadow-sm ${isDarkMode ? "bg-purple-900/40 text-purple-300 border border-purple-700" : "bg-purple-50 text-purple-700 border border-purple-200"}`
                    : `border border-transparent ${isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`
                }`}
              >
                <span>{level.emoji}</span>
                <span>{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div
          className={`p-4 rounded-2xl border mb-6 space-y-4 ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
        >
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
                placeholder="Search ICAN questions..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>

            {/* Paper/Subject */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
            >
              <option value="">All Papers</option>
              {subjects.map((s) => (
                <option key={s.subject} value={s.subject}>
                  {s.subject} ({s.count})
                </option>
              ))}
            </select>

            {/* Diet */}
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? "bg-gray-950 border-gray-800 text-white" : "bg-gray-50 border-gray-200"}`}
            >
              {DIET_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
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

          {/* Active Filters & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters && (
                <>
                  <Filter size={14} className="text-indigo-500" />
                  <span
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Active filters:
                  </span>
                  {skillLevel !== "all" && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${skillLevelColors[skillLevel] || ""}`}
                    >
                      {skillLevel}
                    </span>
                  )}
                  {diet && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${isDarkMode ? "bg-teal-900/30 text-teal-300" : "bg-teal-100 text-teal-700"}`}
                    >
                      {diet} diet
                    </span>
                  )}
                  {subject && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
                    >
                      {subject}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-500 hover:text-indigo-400 font-medium flex items-center gap-1"
                  >
                    <X size={12} /> Clear all
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                showAnswers
                  ? isDarkMode
                    ? "bg-indigo-900/30 text-indigo-300"
                    : "bg-indigo-100 text-indigo-700"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-400 hover:text-gray-300"
                    : "bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              {showAnswers ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
          </div>
        </div>

        {/* ═══ SELECT ALL + COUNT ═══ */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={selectAll}
            className={`flex items-center gap-2 text-sm font-medium transition ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            {questions.length > 0 &&
            questions.every((q) => selected.includes(q.id)) ? (
              <CheckSquare size={16} className="text-indigo-500" />
            ) : (
              <Square size={16} />
            )}
            Select All on Page
          </button>
          <span className="text-sm text-gray-500">
            {total} question{total !== 1 ? "s" : ""} found
            {selected.length > 0 && (
              <span className="text-indigo-600 font-bold ml-2">
                ({selected.length} selected)
              </span>
            )}
          </span>
        </div>

        {/* ═══ QUESTIONS LIST ═══ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="animate-spin text-indigo-500" size={32} />
            <p className="text-sm text-gray-500">
              Loading ICAN questions...
            </p>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className={`p-4 rounded-2xl mb-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
            >
              <Award
                size={48}
                className={isDarkMode ? "text-gray-700" : "text-gray-300"}
              />
            </div>
            <h3 className="text-lg font-semibold mt-2">
              No ICAN questions found
            </h3>
            <p className="text-gray-500 mt-1 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms."
                : "No ICAN questions have been uploaded yet. Ask your admin to upload ICAN past papers."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-indigo-500 text-sm font-medium hover:text-indigo-400"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const isSelected = selected.includes(q.id);
              const isExpanded = expandedQuestions.has(q.id);

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-600 shadow-sm"
                      : isDarkMode
                        ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Question Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleSelect(q.id)}
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="pt-1 flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected ? "bg-indigo-600 border-indigo-600" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <CheckSquare
                              size={14}
                              className="text-white"
                            />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Question Text */}
                        <p className="text-sm font-medium leading-relaxed mb-3">
                          <MathText text={q.question_text} />
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {(q.options || []).map((opt, idx) => {
                            const letter = ["A", "B", "C", "D"][idx];
                            const isCorrect =
                              letter === q.correct_answer;

                            return (
                              <div
                                key={idx}
                                className={`text-xs px-3 py-2 rounded-lg flex items-start gap-2 ${
                                  showAnswers && isCorrect
                                    ? "bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                                    : isDarkMode
                                      ? "bg-gray-800 text-gray-400"
                                      : "bg-gray-50 text-gray-600"
                                }`}
                              >
                                <span
                                  className={`font-bold flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                                    showAnswers && isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : isDarkMode
                                        ? "bg-gray-700 text-gray-300"
                                        : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="leading-relaxed">
                                  {opt}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation (expandable) */}
                        {q.explanation && (
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(q.id);
                              }}
                              className={`text-xs font-medium flex items-center gap-1 mb-1 ${isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
                            >
                              {isExpanded ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              )}
                              {isExpanded
                                ? "Hide Explanation"
                                : "View Explanation"}
                            </button>
                            {isExpanded && (
                              <div
                                className={`text-xs p-3 rounded-lg mt-1 leading-relaxed ${isDarkMode ? "bg-indigo-950/30 border border-indigo-900/50 text-indigo-200" : "bg-indigo-50 border border-indigo-100 text-indigo-800"}`}
                              >
                                <MathText
                                  text={q.explanation}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-bold uppercase ${isDarkMode ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}
                          >
                            ICAN
                          </span>
                          {q.skill_level && (
                            <span
                              className={`text-xs px-2 py-1 rounded capitalize font-medium ${skillLevelColors[q.skill_level] || ""}`}
                            >
                              {q.skill_level}
                            </span>
                          )}
                          {q.diet && (
                            <span
                              className={`text-xs px-2 py-1 rounded capitalize font-medium ${isDarkMode ? "bg-teal-900/30 text-teal-300" : "bg-teal-100 text-teal-700"}`}
                            >
                              {q.diet} diet
                            </span>
                          )}
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
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ PAGINATION ═══ */}
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

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════ */

const StatCard = ({ icon: Icon, label, value, color, isDarkMode }) => {
  const colorMap = {
    indigo: {
      icon: "text-indigo-500",
      bg: isDarkMode ? "bg-indigo-900/20" : "bg-indigo-50",
    },
    purple: {
      icon: "text-purple-500",
      bg: isDarkMode ? "bg-purple-900/20" : "bg-purple-50",
    },
    blue: {
      icon: "text-blue-500",
      bg: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
    },
    emerald: {
      icon: "text-emerald-500",
      bg: isDarkMode ? "bg-emerald-900/20" : "bg-emerald-50",
    },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon size={18} className={c.icon} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default ICANPastQuestionsLibrary;
