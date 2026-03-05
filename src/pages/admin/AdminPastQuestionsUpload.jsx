import React, { useState, useRef } from "react";
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
} from "lucide-react";

const EXAM_BODIES = [
  { value: "jamb", label: "JAMB (UTME)" },
  { value: "waec", label: "WAEC (SSCE)" },
  { value: "neco", label: "NECO" },
  { value: "nabteb", label: "NABTEB" },
];

const YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i);

const SUBJECTS = [
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

const AdminPastQuestionsUpload = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const fileInputRef = useRef(null);

  // Phase: 'upload' | 'preview'
  const [phase, setPhase] = useState("upload");

  // Upload state
  const [file, setFile] = useState(null);
  const [examBody, setExamBody] = useState("jamb");
  const [examYear, setExamYear] = useState("2024");
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);

  // Preview state
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

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

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!subject) {
      toast.error("Please select a subject");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exam_body", examBody);
      formData.append("exam_year", examYear);
      formData.append("subject", subject);

      const response = await api.post(
        "/admin/past-questions/upload-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000, // 2 min timeout for large PDFs
        },
      );

      if (response.data.success) {
        setQuestions(response.data.questions);
        setPhase("preview");
        toast.success(
          `Parsed ${response.data.count} questions from "${file.name}"`,
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to process file. Try again.",
      );
    } finally {
      setUploading(false);
    }
  };

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
  };

  const handleSave = async () => {
    if (questions.length === 0) return;

    const invalid = questions.filter(
      (q) =>
        !q.question_text ||
        !Array.isArray(q.options) ||
        q.options.length < 4 ||
        !q.correct_answer,
    );
    if (invalid.length > 0) {
      toast.error(
        `${invalid.length} question(s) have missing fields. Please review.`,
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

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className={`flex items-center gap-2 text-sm font-medium mb-3 transition-colors ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ArrowLeft size={16} /> Back to Admin
          </button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="text-green-500" size={28} />
            Upload Past Questions
          </h1>
          <p
            className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Upload PDF/DOCX files with past exam questions — AI will parse them
            automatically
          </p>
        </div>

        {phase === "upload" ? (
          /* ═══ UPLOAD PHASE ═══ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Config */}
            <div className="space-y-6">
              <div
                className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-green-500" />
                  Exam Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Exam Body <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={examBody}
                      onChange={(e) => setExamBody(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      {EXAM_BODIES.map((eb) => (
                        <option key={eb.value} value={eb.value}>
                          {eb.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <Calendar size={14} className="inline mr-1" />
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    >
                      <option value="">Select Subject...</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div
                className={`p-5 rounded-xl border ${isDarkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"}`}
              >
                <h3
                  className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}
                >
                  <AlertCircle size={16} /> Tips for best results
                </h3>
                <ul
                  className={`text-sm space-y-1.5 ${isDarkMode ? "text-blue-200" : "text-blue-800"}`}
                >
                  <li>
                    • PDF should have clear questions with A/B/C/D options
                  </li>
                  <li>• Scanned PDFs work too (AI reads the image)</li>
                  <li>• Include answers if available for better parsing</li>
                  <li>• Max file size: 10MB</li>
                </ul>
              </div>
            </div>

            {/* Right: File Drop Zone */}
            <div className="lg:col-span-2">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all h-full min-h-[400px] ${
                  file
                    ? isDarkMode
                      ? "border-green-600 bg-green-900/10"
                      : "border-green-400 bg-green-50"
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
                      className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? "bg-green-900/30" : "bg-green-100"}`}
                    >
                      <FileText size={32} className="text-green-500" />
                    </div>
                    <p className="text-lg font-bold">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB •{" "}
                      {file.type.split("/").pop().toUpperCase()}
                    </p>
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
                      Drop your past questions file here
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
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  }`}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="animate-spin" size={22} />
                      AI is parsing questions... (this may take a minute)
                    </>
                  ) : (
                    <>
                      <Upload size={22} />
                      Upload & Parse with AI
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ═══ PREVIEW PHASE ═══ */
          <div className="space-y-6">
            {/* Toolbar */}
            <div
              className={`sticky top-4 z-30 p-4 rounded-xl border shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 ${isDarkMode ? "bg-gray-900/95 border-gray-800 backdrop-blur" : "bg-white/95 border-gray-200 backdrop-blur"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600"}`}
                >
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Review Parsed Questions</h2>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {questions.length} questions from {file?.name} •{" "}
                    {examBody.toUpperCase()} {examYear} {subject}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (
                      window.confirm("Discard and upload a different file?")
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
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save {questions.length} Questions
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Question Cards */}
            <div className="grid gap-5">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-xl border transition-all ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                >
                  {/* Card Header */}
                  <div
                    className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "border-gray-800 bg-gray-800/30" : "border-gray-100 bg-gray-50/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"}`}
                      >
                        Question {idx + 1}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded uppercase font-bold ${isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-600"}`}
                      >
                        {q.exam_body}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-6 grid gap-5">
                    {/* Question Text */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                        Question Text
                      </label>
                      <div
                        className={`mb-2 p-3 rounded-lg text-sm border ${isDarkMode ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}
                      >
                        <MathText text={q.question_text || "Preview..."} />
                      </div>
                      <textarea
                        value={q.question_text}
                        onChange={(e) =>
                          handleEdit(idx, "question_text", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                        rows="2"
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["A", "B", "C", "D"].map((letter, optIdx) => (
                        <div key={letter}>
                          <label
                            className={`block text-xs font-bold uppercase mb-1.5 ${q.correct_answer === letter ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}
                          >
                            Option {letter}{" "}
                            {q.correct_answer === letter && "(Correct ✓)"}
                          </label>
                          <input
                            value={q.options?.[optIdx] || ""}
                            onChange={(e) => {
                              const newOpts = [...(q.options || [])];
                              newOpts[optIdx] = e.target.value;
                              handleEdit(idx, "options", newOpts);
                            }}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"} ${q.correct_answer === letter ? "ring-2 ring-green-500 border-green-500" : ""}`}
                          />
                        </div>
                      ))}
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
                            handleEdit(idx, "correct_answer", e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                        >
                          {["A", "B", "C", "D"].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                          Difficulty
                        </label>
                        <select
                          value={q.difficulty}
                          onChange={(e) =>
                            handleEdit(idx, "difficulty", e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
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
                            handleEdit(idx, "topic", e.target.value)
                          }
                          placeholder="e.g. Algebra"
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
                            handleEdit(idx, "explanation", e.target.value)
                          }
                          placeholder="Optional"
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPastQuestionsUpload;
