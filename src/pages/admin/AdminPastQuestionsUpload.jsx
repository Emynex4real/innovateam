import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useDarkMode } from "../../contexts/DarkModeContext";
import MathText from "../../components/MathText";
import {
  ArrowLeft,
  Upload,
  FileText,
  Save,
  Trash2,
  CheckCircle,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Calendar,
  AlertCircle,
  X,
  Award,
  Briefcase,
  Layers,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Hash,
  Sparkles,
  Shield,
  Target,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   CONSTANTS — Separate data for each exam category
   ═══════════════════════════════════════════════════ */

// ─── Secondary Exams (JAMB/WAEC/NECO/NABTEB) ───
const SECONDARY_EXAM_BODIES = [
  { value: "jamb", label: "JAMB (UTME)", icon: "🎓" },
  { value: "waec", label: "WAEC (SSCE)", icon: "📝" },
  { value: "neco", label: "NECO", icon: "📋" },
  { value: "nabteb", label: "NABTEB", icon: "🔧" },
];

const SECONDARY_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature",
  "Commerce",
  "Accounting",
  "CRK",
  "IRK",
  "Geography",
  "Civic Education",
  "Agricultural Science",
  "Computer Science",
  "Further Mathematics",
  "Yoruba",
  "Igbo",
  "Hausa",
];

// ─── ICAN Professional Exams ───
const ICAN_SKILL_LEVELS = [
  {
    value: "foundation",
    label: "Foundation Level",
    description: "Entry-level papers for new ICAN students",
    color: "emerald",
  },
  {
    value: "skills",
    label: "Skills Level",
    description: "Intermediate professional competency papers",
    color: "blue",
  },
  {
    value: "professional",
    label: "Professional Level",
    description: "Advanced papers for final qualification",
    color: "purple",
  },
];

const ICAN_SUBJECTS_BY_LEVEL = {
  foundation: [
    "Business and Finance",
    "Financial Accounting",
    "Management Information",
    "Business Law",
  ],
  skills: [
    "Financial Reporting",
    "Audit and Assurance",
    "Taxation",
    "Management Accounting",
    "Public Sector Accounting and Finance",
  ],
  professional: [
    "Corporate Reporting",
    "Advanced Audit and Assurance",
    "Strategic Financial Management",
    "Advanced Taxation",
    "Case Study",
  ],
};

const ICAN_DIETS = [
  { value: "march", label: "March Diet", icon: "🌱" },
  { value: "may", label: "May Diet", icon: "☀️" },
  { value: "november", label: "November Diet", icon: "🍂" },
];

const YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i);

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

const AdminPastQuestionsUpload = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const fileInputRef = useRef(null);

  // ─── Exam Category Mode ───
  const [examCategory, setExamCategory] = useState("secondary"); // 'secondary' | 'ican'

  // ─── Phase ───
  const [phase, setPhase] = useState("upload"); // 'upload' | 'preview'

  // ─── Upload state (shared) ───
  const [file, setFile] = useState(null);
  const [examYear, setExamYear] = useState("2024");
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);

  // ─── Secondary-specific ───
  const [examBody, setExamBody] = useState("jamb");

  // ─── ICAN-specific ───
  const [icanSkillLevel, setIcanSkillLevel] = useState("foundation");
  const [icanDiet, setIcanDiet] = useState("march");

  // ─── Preview state ───
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [expandedCards, setExpandedCards] = useState(new Set());

  // ─── Derived ───
  const currentSubjects = useMemo(() => {
    if (examCategory === "ican") {
      return ICAN_SUBJECTS_BY_LEVEL[icanSkillLevel] || [];
    }
    return SECONDARY_SUBJECTS;
  }, [examCategory, icanSkillLevel]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q, idx) => {
      const matchesSearch =
        !searchTerm ||
        q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `question ${idx + 1}`.includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        filterDifficulty === "all" || q.difficulty === filterDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [questions, searchTerm, filterDifficulty]);

  const questionStats = useMemo(() => {
    const stats = { easy: 0, medium: 0, hard: 0, total: questions.length };
    questions.forEach((q) => {
      if (q.difficulty === "easy") stats.easy++;
      else if (q.difficulty === "hard") stats.hard++;
      else stats.medium++;
    });
    return stats;
  }, [questions]);

  // Reset subject when switching categories or skill levels
  const handleCategorySwitch = (cat) => {
    setExamCategory(cat);
    setSubject("");
    setFile(null);
    setQuestions([]);
    setPhase("upload");
  };

  const handleSkillLevelChange = (level) => {
    setIcanSkillLevel(level);
    setSubject(""); // Reset subject since subjects differ per level
  };

  // ─── File Handling ───
  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (droppedFile) {
      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!allowed.includes(droppedFile.type)) {
        toast.error("Only PDF, DOCX, and TXT files are allowed");
        return;
      }
      setFile(droppedFile);
    }
  };

  // ─── Upload ───
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!subject) {
      toast.error("Please select a subject/paper");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exam_year", examYear);
      formData.append("subject", subject);

      if (examCategory === "ican") {
        formData.append("exam_body", "ican");
        formData.append("diet", icanDiet);
        formData.append("skill_level", icanSkillLevel);
      } else {
        formData.append("exam_body", examBody);
      }

      const response = await api.post(
        "/admin/past-questions/upload-pdf",
        formData,
        { timeout: 120000 }
      );

      if (response.data.success) {
        setQuestions(response.data.questions);
        setPhase("preview");
        // Expand all cards initially
        setExpandedCards(
          new Set(response.data.questions.map((_, i) => i))
        );
        toast.success(
          `Parsed ${response.data.count} questions from "${file.name}"`
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to process file. Try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // ─── Edit / Remove ───
  const handleEdit = (index, field, value) => {
    const updated = [...questions];
    if (field === "options") {
      updated[index].options = value;
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  const handleRemove = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    expandedCards.delete(index);
  };

  const toggleCard = (index) => {
    const updated = new Set(expandedCards);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setExpandedCards(updated);
  };

  const expandAll = () =>
    setExpandedCards(new Set(questions.map((_, i) => i)));
  const collapseAll = () => setExpandedCards(new Set());

  // ─── Save ───
  const handleSave = async () => {
    if (questions.length === 0) return;

    const invalid = questions.filter(
      (q) =>
        !q.question_text ||
        !Array.isArray(q.options) ||
        q.options.length < 4 ||
        !q.correct_answer
    );
    if (invalid.length > 0) {
      toast.error(
        `${invalid.length} question(s) have missing fields. Please review.`
      );
      return;
    }

    setSaving(true);
    try {
      const response = await api.post("/admin/past-questions/save", {
        questions,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setPhase("upload");
        setFile(null);
        setQuestions([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ─── Theme colors per category ───
  const accent = examCategory === "ican" ? "indigo" : "green";
  const accentClasses = {
    green: {
      badge: isDarkMode
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-700",
      button: "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
      ring: "focus:ring-green-500",
      icon: "text-green-500",
      border: isDarkMode ? "border-green-600 bg-green-900/10" : "border-green-400 bg-green-50",
      tabActive: isDarkMode
        ? "bg-green-900/40 text-green-300 border-green-500"
        : "bg-green-50 text-green-700 border-green-500",
    },
    indigo: {
      badge: isDarkMode
        ? "bg-indigo-900/30 text-indigo-300"
        : "bg-indigo-100 text-indigo-700",
      button: "from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
      ring: "focus:ring-indigo-500",
      icon: "text-indigo-500",
      border: isDarkMode ? "border-indigo-600 bg-indigo-900/10" : "border-indigo-400 bg-indigo-50",
      tabActive: isDarkMode
        ? "bg-indigo-900/40 text-indigo-300 border-indigo-500"
        : "bg-indigo-50 text-indigo-700 border-indigo-500",
    },
  }[accent];

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin")}
            className={`flex items-center gap-2 text-sm font-medium mb-3 transition-colors ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ArrowLeft size={16} /> Back to Admin
          </button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className={accentClasses.icon} size={28} />
            Upload Past Questions
          </h1>
          <p
            className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Upload PDF/DOCX files with past exam questions — AI will parse them
            automatically
          </p>
        </div>

        {/* ═══ EXAM CATEGORY TABS ═══ */}
        <div className="mb-8">
          <div
            className={`inline-flex rounded-xl p-1.5 gap-1 ${isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-gray-100 border border-gray-200"}`}
          >
            <button
              onClick={() => handleCategorySwitch("secondary")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
                examCategory === "secondary"
                  ? `${accentClasses.tabActive} border shadow-sm`
                  : isDarkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <GraduationCap size={18} />
              <span>Secondary Exams</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  examCategory === "secondary"
                    ? isDarkMode
                      ? "bg-green-800/50 text-green-300"
                      : "bg-green-200 text-green-800"
                    : isDarkMode
                      ? "bg-gray-800 text-gray-500"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                JAMB / WAEC
              </span>
            </button>
            <button
              onClick={() => handleCategorySwitch("ican")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
                examCategory === "ican"
                  ? `${accentClasses.tabActive} border shadow-sm`
                  : isDarkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <Award size={18} />
              <span>Professional Exams</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  examCategory === "ican"
                    ? isDarkMode
                      ? "bg-indigo-800/50 text-indigo-300"
                      : "bg-indigo-200 text-indigo-800"
                    : isDarkMode
                      ? "bg-gray-800 text-gray-500"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                ICAN
              </span>
            </button>
          </div>
        </div>

        {phase === "upload" ? (
          /* ═══════════════════════════════════════
             UPLOAD PHASE
             ═══════════════════════════════════════ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Config */}
            <div className="space-y-6">
              <div
                className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  {examCategory === "ican" ? (
                    <Award size={20} className={accentClasses.icon} />
                  ) : (
                    <GraduationCap size={20} className={accentClasses.icon} />
                  )}
                  {examCategory === "ican"
                    ? "ICAN Exam Details"
                    : "Exam Details"}
                </h2>

                <div className="space-y-4">
                  {/* ─── SECONDARY: Exam Body Selector ─── */}
                  {examCategory === "secondary" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Exam Body <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={examBody}
                        onChange={(e) => setExamBody(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border ${accentClasses.ring} focus:ring-2 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                      >
                        {SECONDARY_EXAM_BODIES.map((eb) => (
                          <option key={eb.value} value={eb.value}>
                            {eb.icon} {eb.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ─── ICAN: Skill Level Selector ─── */}
                  {examCategory === "ican" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Layers size={14} className="inline mr-1" />
                        Skill Level <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {ICAN_SKILL_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            onClick={() =>
                              handleSkillLevelChange(level.value)
                            }
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                              icanSkillLevel === level.value
                                ? isDarkMode
                                  ? "border-indigo-500 bg-indigo-900/20 ring-2 ring-indigo-500/30"
                                  : "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                                : isDarkMode
                                  ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">
                                {level.label}
                              </span>
                              {icanSkillLevel === level.value && (
                                <CheckCircle
                                  size={16}
                                  className="text-indigo-500"
                                />
                              )}
                            </div>
                            <p
                              className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {level.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── ICAN: Diet Selector ─── */}
                  {examCategory === "ican" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        <Calendar size={14} className="inline mr-1" />
                        Diet/Session <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={icanDiet}
                        onChange={(e) => setIcanDiet(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border ${accentClasses.ring} focus:ring-2 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                      >
                        {ICAN_DIETS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.icon} {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ─── Year (shared) ─── */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <Calendar size={14} className="inline mr-1" />
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border ${accentClasses.ring} focus:ring-2 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ─── Subject/Paper (dynamic list) ─── */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {examCategory === "ican" ? "Paper" : "Subject"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border ${accentClasses.ring} focus:ring-2 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      <option value="">
                        Select{" "}
                        {examCategory === "ican" ? "Paper" : "Subject"}...
                      </option>
                      {currentSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tips Box */}
              <div
                className={`p-5 rounded-xl border ${
                  examCategory === "ican"
                    ? isDarkMode
                      ? "bg-indigo-900/20 border-indigo-800"
                      : "bg-indigo-50 border-indigo-100"
                    : isDarkMode
                      ? "bg-blue-900/20 border-blue-800"
                      : "bg-blue-50 border-blue-100"
                }`}
              >
                <h3
                  className={`font-bold mb-2 flex items-center gap-2 ${
                    examCategory === "ican"
                      ? isDarkMode
                        ? "text-indigo-300"
                        : "text-indigo-700"
                      : isDarkMode
                        ? "text-blue-300"
                        : "text-blue-700"
                  }`}
                >
                  <AlertCircle size={16} />
                  {examCategory === "ican"
                    ? "Tips for ICAN uploads"
                    : "Tips for best results"}
                </h3>
                <ul
                  className={`text-sm space-y-1.5 ${
                    examCategory === "ican"
                      ? isDarkMode
                        ? "text-indigo-200"
                        : "text-indigo-800"
                      : isDarkMode
                        ? "text-blue-200"
                        : "text-blue-800"
                  }`}
                >
                  {examCategory === "ican" ? (
                    <>
                      <li>
                        • Upload ICAN past question papers from official sources
                      </li>
                      <li>
                        • AI will parse multiple-choice and structured questions
                      </li>
                      <li>
                        • Include answers/solutions for better accuracy
                      </li>
                      <li>
                        • Questions are tagged by skill level and diet for filtering
                      </li>
                      <li>• Max file size: 10MB</li>
                    </>
                  ) : (
                    <>
                      <li>
                        • PDF should have clear questions with A/B/C/D options
                      </li>
                      <li>• Scanned PDFs work too (AI reads the image)</li>
                      <li>
                        • Include answers if available for better parsing
                      </li>
                      <li>• Max file size: 10MB</li>
                    </>
                  )}
                </ul>
              </div>

              {/* ICAN Info Card */}
              {examCategory === "ican" && (
                <div
                  className={`p-5 rounded-xl border ${isDarkMode ? "bg-purple-900/10 border-purple-800/50" : "bg-purple-50 border-purple-100"}`}
                >
                  <h3
                    className={`font-bold mb-3 flex items-center gap-2 text-sm ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
                  >
                    <Briefcase size={16} />
                    About ICAN Tutorial Centers
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${isDarkMode ? "text-purple-200/70" : "text-purple-700/80"}`}
                  >
                    Questions uploaded here are accessible by ICAN tutorial
                    center students for practice. Each question is categorized
                    by skill level, diet, and paper for easy filtering during
                    study sessions.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${isDarkMode ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      Foundation
                    </span>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}
                    >
                      Skills
                    </span>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"}`}
                    >
                      Professional
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: File Drop Zone */}
            <div className="lg:col-span-2">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all h-full min-h-[400px] ${
                  file
                    ? accentClasses.border
                    : isDarkMode
                      ? "border-gray-700 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/50"
                      : "border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileDrop}
                  className="hidden"
                />

                {file ? (
                  <div className="text-center p-8">
                    <div
                      className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                        examCategory === "ican"
                          ? isDarkMode
                            ? "bg-indigo-900/30"
                            : "bg-indigo-100"
                          : isDarkMode
                            ? "bg-green-900/30"
                            : "bg-green-100"
                      }`}
                    >
                      <FileText
                        size={32}
                        className={accentClasses.icon}
                      />
                    </div>
                    <p className="text-lg font-bold">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB •{" "}
                      {file.type.split("/").pop().toUpperCase()}
                    </p>
                    {examCategory === "ican" && (
                      <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isDarkMode ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}
                        >
                          <Award
                            size={12}
                            className="inline mr-1"
                          />
                          ICAN
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"}`}
                        >
                          {icanSkillLevel}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}
                        >
                          {icanDiet} Diet
                        </span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-3 text-red-500 text-sm font-medium hover:underline flex items-center gap-1 mx-auto"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div
                      className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
                    >
                      <Upload size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-bold">
                      Drop your{" "}
                      {examCategory === "ican"
                        ? "ICAN past paper"
                        : "past questions file"}{" "}
                      here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or click to browse • PDF, DOCX, TXT
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading || !subject}
                  className={`w-full mt-4 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${
                    uploading || !subject
                      ? "bg-gray-500 cursor-not-allowed"
                      : `bg-gradient-to-r ${accentClasses.button}`
                  }`}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="animate-spin" size={22} />
                      AI is parsing questions... (this may take a minute)
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} />
                      Upload & Parse with AI
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════
             PREVIEW PHASE
             ═══════════════════════════════════════ */
          <div className="space-y-6">
            {/* Stats Bar */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-4`}
            >
              {[
                {
                  label: "Total Questions",
                  value: questionStats.total,
                  icon: Hash,
                  color: isDarkMode
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-200",
                },
                {
                  label: "Easy",
                  value: questionStats.easy,
                  icon: Target,
                  color: isDarkMode
                    ? "bg-emerald-950/50 border-emerald-800/50"
                    : "bg-emerald-50 border-emerald-200",
                },
                {
                  label: "Medium",
                  value: questionStats.medium,
                  icon: BarChart3,
                  color: isDarkMode
                    ? "bg-amber-950/50 border-amber-800/50"
                    : "bg-amber-50 border-amber-200",
                },
                {
                  label: "Hard",
                  value: questionStats.hard,
                  icon: Shield,
                  color: isDarkMode
                    ? "bg-red-950/50 border-red-800/50"
                    : "bg-red-50 border-red-200",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-4 rounded-xl border ${stat.color}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={16} className="text-gray-400" />
                    <span
                      className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div
              className={`sticky top-4 z-30 p-4 rounded-xl border shadow-lg ${isDarkMode ? "bg-gray-900/95 border-gray-800 backdrop-blur" : "bg-white/95 border-gray-200 backdrop-blur"}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${accentClasses.badge}`}
                  >
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">
                      Review Parsed Questions
                    </h2>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {questions.length} questions from {file?.name}
                      {examCategory === "ican" ? (
                        <>
                          {" "}
                          • ICAN{" "}
                          <span className="capitalize">
                            {icanSkillLevel}
                          </span>{" "}
                          • {subject} •{" "}
                          <span className="capitalize">{icanDiet}</span>{" "}
                          {examYear}
                        </>
                      ) : (
                        <>
                          {" "}
                          • {examBody.toUpperCase()} {examYear} {subject}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Discard and upload a different file?"
                        )
                      ) {
                        setPhase("upload");
                        setQuestions([]);
                        setFile(null);
                      }
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${accentClasses.button}`}
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={18}
                          className="animate-spin"
                        />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Save {questions.length}{" "}
                        Questions
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search & Filter Row */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search questions..."
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 placeholder-gray-400"}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-400" />
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <button
                    onClick={expandAll}
                    title="Expand all"
                    className={`p-2 rounded-lg border transition-colors ${isDarkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={collapseAll}
                    title="Collapse all"
                    className={`p-2 rounded-lg border transition-colors ${isDarkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <ChevronUp size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtered results notice */}
            {(searchTerm || filterDifficulty !== "all") && (
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Showing {filteredQuestions.length} of {questions.length}{" "}
                questions
                {searchTerm && ` matching "${searchTerm}"`}
                {filterDifficulty !== "all" &&
                  ` (${filterDifficulty} difficulty)`}
              </p>
            )}

            {/* Question Cards */}
            <div className="grid gap-5">
              {filteredQuestions.map((q) => {
                const idx = questions.indexOf(q);
                const isExpanded = expandedCards.has(idx);

                return (
                  <div
                    key={idx}
                    className={`group relative rounded-xl border transition-all ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                  >
                    {/* Card Header (always visible) */}
                    <div
                      className={`p-4 border-b flex justify-between items-center cursor-pointer ${isDarkMode ? "border-gray-800 bg-gray-800/30" : "border-gray-100 bg-gray-50/50"}`}
                      onClick={() => toggleCard(idx)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${accentClasses.badge}`}
                        >
                          Question {idx + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded uppercase font-bold ${
                            q.exam_body === "ican"
                              ? isDarkMode
                                ? "bg-indigo-900/30 text-indigo-300"
                                : "bg-indigo-100 text-indigo-600"
                              : isDarkMode
                                ? "bg-blue-900/30 text-blue-300"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {q.exam_body}
                        </span>
                        {q.skill_level && (
                          <span
                            className={`text-xs px-2 py-1 rounded capitalize font-medium ${isDarkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-600"}`}
                          >
                            {q.skill_level}
                          </span>
                        )}
                        {q.diet && (
                          <span
                            className={`text-xs px-2 py-1 rounded capitalize font-medium ${isDarkMode ? "bg-teal-900/30 text-teal-300" : "bg-teal-100 text-teal-600"}`}
                          >
                            {q.diet} diet
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            q.difficulty === "easy"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : q.difficulty === "hard"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {q.difficulty || "medium"}
                        </span>
                        {/* Truncated question preview */}
                        {!isExpanded && (
                          <span
                            className={`text-xs truncate max-w-[200px] sm:max-w-[400px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            {q.question_text?.substring(0, 80)}
                            {q.question_text?.length > 80 ? "..." : ""}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(idx);
                          }}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        {isExpanded ? (
                          <ChevronUp
                            size={18}
                            className="text-gray-400"
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                            className="text-gray-400"
                          />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-6 grid gap-5">
                        {/* Question Text */}
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                            Question Text
                          </label>
                          <div
                            className={`mb-2 p-3 rounded-lg text-sm border ${isDarkMode ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}
                          >
                            <MathText
                              text={
                                q.question_text || "Preview..."
                              }
                            />
                          </div>
                          <textarea
                            value={q.question_text}
                            onChange={(e) =>
                              handleEdit(
                                idx,
                                "question_text",
                                e.target.value
                              )
                            }
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 ${accentClasses.ring} focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            rows="2"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["A", "B", "C", "D"].map(
                            (letter, optIdx) => (
                              <div key={letter}>
                                <label
                                  className={`block text-xs font-bold uppercase mb-1.5 ${q.correct_answer === letter ? `${examCategory === "ican" ? "text-indigo-600 dark:text-indigo-400" : "text-green-600 dark:text-green-400"}` : "text-gray-500"}`}
                                >
                                  Option {letter}{" "}
                                  {q.correct_answer === letter &&
                                    "(Correct ✓)"}
                                </label>
                                <input
                                  value={
                                    q.options?.[optIdx] || ""
                                  }
                                  onChange={(e) => {
                                    const newOpts = [
                                      ...(q.options || []),
                                    ];
                                    newOpts[optIdx] =
                                      e.target.value;
                                    handleEdit(
                                      idx,
                                      "options",
                                      newOpts
                                    );
                                  }}
                                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 ${accentClasses.ring} ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"} ${
                                    q.correct_answer === letter
                                      ? examCategory === "ican"
                                        ? "ring-2 ring-indigo-500 border-indigo-500"
                                        : "ring-2 ring-green-500 border-green-500"
                                      : ""
                                  }`}
                                />
                              </div>
                            )
                          )}
                        </div>

                        {/* Meta Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                              Correct Answer
                            </label>
                            <select
                              value={q.correct_answer}
                              onChange={(e) =>
                                handleEdit(
                                  idx,
                                  "correct_answer",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                            >
                              {["A", "B", "C", "D"].map(
                                (opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                              Difficulty
                            </label>
                            <select
                              value={q.difficulty}
                              onChange={(e) =>
                                handleEdit(
                                  idx,
                                  "difficulty",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">
                                Medium
                              </option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                              Topic
                            </label>
                            <input
                              value={q.topic || ""}
                              onChange={(e) =>
                                handleEdit(
                                  idx,
                                  "topic",
                                  e.target.value
                                )
                              }
                              placeholder={
                                examCategory === "ican"
                                  ? "e.g. IAS 16"
                                  : "e.g. Algebra"
                              }
                              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                              Explanation
                            </label>
                            <input
                              value={q.explanation || ""}
                              onChange={(e) =>
                                handleEdit(
                                  idx,
                                  "explanation",
                                  e.target.value
                                )
                              }
                              placeholder="Optional"
                              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty state when filtered */}
            {filteredQuestions.length === 0 && questions.length > 0 && (
              <div className="text-center py-12">
                <Search
                  size={48}
                  className={`mx-auto mb-4 ${isDarkMode ? "text-gray-700" : "text-gray-300"}`}
                />
                <p className="font-semibold text-lg">
                  No questions match your filters
                </p>
                <p
                  className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  Try adjusting your search or difficulty filter
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDifficulty("all");
                  }}
                  className={`mt-3 text-sm font-medium ${examCategory === "ican" ? "text-indigo-500 hover:text-indigo-400" : "text-green-500 hover:text-green-400"}`}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPastQuestionsUpload;
