import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flag, AlertTriangle, Calculator, Maximize } from "lucide-react";
import studentTCService from "../../../services/studentTC.service";
import { useAntiCheat } from "../../../hooks/useAntiCheat";
import proctoringService from "../../../services/proctoring.service";
import MathText from "../../../components/MathText";
import CBTCalculator from "../../../components/CBTCalculator";
import toast from "react-hot-toast";

/**
 * CBT Simulator — Replicates the real JAMB CBT interface.
 * Features:
 *   - Blue header bar with timer
 *   - Subject-based navigation (JAMB multi-subject)
 *   - Question grid (green=answered, orange=flagged, white=unanswered)
 *   - Draggable scientific calculator
 *   - Full-screen lockdown mode
 */
const CBTSimulator = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  // State
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLockdownWarning, setShowLockdownWarning] = useState(false);
  const [lockdownExitCount, setLockdownExitCount] = useState(0);

  // Subject navigation (JAMB multi-subject)
  const [currentSubject, setCurrentSubject] = useState(null);

  // Refs
  const { violations, getViolations, getFingerprint } = useAntiCheat(testId);
  const startTimeRef = useRef(Date.now());

  // Signal exam mode to pause all background polling
  useEffect(() => {
    window.dispatchEvent(new Event('exam-mode-start'));
    return () => window.dispatchEvent(new Event('exam-mode-end'));
  }, []);

  // Load test
  useEffect(() => {
    const load = async () => {
      try {
        const accessRes = await studentTCService.checkTestAccess(testId);
        if (!accessRes.canAttempt) {
          toast.error(
            accessRes.reason === "max_attempts_reached"
              ? `Maximum attempts reached`
              : `Please wait before retrying`,
          );
          navigate("/student/tests");
          return;
        }
        const res = await studentTCService.getTest(testId);
        if (res.success) {
          setTest(res.questionSet);
          setTimeLeft(res.questionSet.time_limit * 60);
        }
      } catch {
        toast.error("Failed to load test");
        navigate("/student/tests");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Full-screen lockdown
  useEffect(() => {
    if (!test?.enable_lockdown) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowLockdownWarning(true);
        setLockdownExitCount((prev) => prev + 1);
      } else {
        setShowLockdownWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Auto-request fullscreen on mount
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [test?.enable_lockdown]);

  const returnToFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setShowLockdownWarning(false);
  };

  // Group questions by subject for JAMB mode
  const isJamb = test?.exam_type === "jamb";
  const subjectGroups = useMemo(() => {
    if (!test?.questions || !isJamb) return null;
    const groups = {};
    test.questions.forEach((q, idx) => {
      const subject = q.subject || "General";
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push({ ...q, globalIdx: idx });
    });
    return groups;
  }, [test?.questions, isJamb]);

  const subjects = useMemo(
    () => (subjectGroups ? Object.keys(subjectGroups) : []),
    [subjectGroups],
  );

  // Set initial subject
  useEffect(() => {
    if (subjects.length > 0 && !currentSubject) {
      setCurrentSubject(subjects[0]);
    }
  }, [subjects, currentSubject]);

  // Active questions list based on mode
  const activeQuestions = useMemo(() => {
    if (!test?.questions) return [];
    if (isJamb && subjectGroups && currentSubject) {
      return subjectGroups[currentSubject] || [];
    }
    return test.questions.map((q, idx) => ({ ...q, globalIdx: idx }));
  }, [test?.questions, isJamb, subjectGroups, currentSubject]);

  // The globally indexed current question
  const currentQuestion = test?.questions?.[currentIdx];

  // Map from subject-local index to global index
  const handleSubjectQuestionClick = (globalIdx) => {
    setCurrentIdx(globalIdx);
  };

  // Handlers
  const handleAnswer = (questionId, letter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;

    if (!autoSubmit) {
      const unanswered = test.questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        setShowSubmitConfirm(true);
        return;
      }
    }

    setSubmitting(true);
    try {
      const totalTimeTaken = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      const formattedAnswers = test.questions.map((q) => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null,
      }));

      const payload = {
        question_set_id: testId,
        answers: formattedAnswers,
        time_taken: totalTimeTaken,
        suspicious_events: getViolations(),
        device_fingerprint: getFingerprint(),
      };

      const response = await studentTCService.submitAttempt(payload);

      if (response.success) {
        if (response.attempt_id) {
          try {
            await proctoringService.logSession(
              response.attempt_id,
              testId,
              getFingerprint(),
              getViolations(),
            );
          } catch {}
        }
        toast.success(
          autoSubmit ? "Time Up! Test Submitted." : "Test Completed!",
        );
        setTimeout(
          () => navigate(`/student/results/${testId}`, { replace: true }),
          100,
        );
      } else {
        toast.error(response.message || "Submission failed");
        setSubmitting(false);
      }
    } catch {
      toast.error("Submission failed. Check your connection.");
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);
    handleSubmit(true);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4" />
        <p className="text-white text-lg font-semibold">
          Loading JAMB CBT Environment...
        </p>
      </div>
    );
  }

  if (!test) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = test.questions.length - answeredCount;

  // Per-subject stats
  const getSubjectStats = (subject) => {
    if (!subjectGroups?.[subject]) return { answered: 0, total: 0 };
    const qs = subjectGroups[subject];
    const answered = qs.filter((q) => answers[q.id]).length;
    return { answered, total: qs.length };
  };

  return (
    <div
      className="min-h-screen bg-[#f0f0f0] flex flex-col select-none"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* ═══ TOP HEADER BAR — JAMB Style ═══ */}
      <header className="bg-gradient-to-r from-[#003366] to-[#004488] text-white px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#003366] font-black text-sm">
                {isJamb ? "JAMB" : "CBT"}
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[250px] md:max-w-none">
                {test.title}
              </h1>
              <p className="text-xs text-blue-200">
                {isJamb ? "JAMB UTME CBT Practice" : "Computer Based Test"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Calculator Toggle */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                showCalculator
                  ? "bg-green-500 text-white"
                  : "bg-[#005599] text-white hover:bg-[#0066aa]"
              }`}
              title="Toggle Calculator"
            >
              <Calculator size={14} />
              <span className="hidden sm:inline">Calc</span>
            </button>

            {/* Violation badge */}
            {lockdownExitCount > 0 && (
              <span className="px-2 py-1 bg-red-600 rounded text-xs font-bold animate-pulse">
                ⚠ {lockdownExitCount}
              </span>
            )}

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold tracking-wider ${
                timeLeft < 300 ? "bg-red-600 animate-pulse" : "bg-[#005599]"
              }`}
            >
              <span>⏱</span>
              {hours > 0 && <span>{hours}:</span>}
              <span>
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ SUBJECT TABS (JAMB only) ═══ */}
      {isJamb && subjects.length > 1 && (
        <div className="bg-[#002244] border-b border-[#003366]">
          <div className="flex overflow-x-auto">
            {subjects.map((subject) => {
              const stats = getSubjectStats(subject);
              const isActive = currentSubject === subject;
              return (
                <button
                  key={subject}
                  onClick={() => {
                    setCurrentSubject(subject);
                    const firstQ = subjectGroups[subject]?.[0];
                    if (firstQ) setCurrentIdx(firstQ.globalIdx);
                  }}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? "border-white text-white bg-[#003366]"
                      : "border-transparent text-blue-300 hover:text-white hover:bg-[#002d4d]"
                  }`}
                >
                  <span>{subject}</span>
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      isActive ? "bg-white/20" : "bg-white/10"
                    }`}
                  >
                    {stats.answered}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* LEFT PANEL — Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {currentQuestion && (
            <>
              {/* Question Header */}
              <div className="bg-[#003366] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
                <span className="font-bold text-sm">
                  Question {currentIdx + 1} of {test.questions.length}
                  {isJamb && currentQuestion.subject && (
                    <span className="ml-2 text-blue-200 font-normal">
                      — {currentQuestion.subject}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${
                    flagged[currentQuestion.id]
                      ? "bg-orange-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Flag
                    size={12}
                    fill={flagged[currentQuestion.id] ? "currentColor" : "none"}
                  />
                  {flagged[currentQuestion.id] ? "Flagged" : "Flag"}
                </button>
              </div>

              {/* Question Body */}
              <div className="bg-white rounded-b-lg shadow-md p-6 md:p-8 mb-4">
                {/* Question Image */}
                {currentQuestion.image_url && (
                  <div className="mb-4">
                    <img
                      src={currentQuestion.image_url}
                      alt="Question diagram"
                      className="max-w-full max-h-[300px] rounded-lg border border-gray-200 mx-auto object-contain"
                    />
                  </div>
                )}
                <div className="text-base md:text-lg leading-relaxed text-gray-900 mb-8">
                  <MathText text={currentQuestion.question_text} />
                </div>

                {/* Options — JAMB Style Radio Buttons */}
                <div className="space-y-3">
                  {["A", "B", "C", "D"].map((letter, idx) => {
                    const isSelected = answers[currentQuestion.id] === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => handleAnswer(currentQuestion.id, letter)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-[#003366] bg-[#e8f0fe]"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "border-[#003366] bg-[#003366]"
                              : "border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`font-bold text-sm w-6 ${isSelected ? "text-[#003366]" : "text-gray-500"}`}
                        >
                          {letter}.
                        </span>
                        <span
                          className={`flex-1 text-sm md:text-base ${isSelected ? "text-[#003366] font-medium" : "text-gray-700"}`}
                        >
                          <MathText text={currentQuestion.options[idx]} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() =>
                    currentIdx > 0 && setCurrentIdx(currentIdx - 1)
                  }
                  disabled={currentIdx === 0}
                  className="px-6 py-3 bg-[#003366] text-white rounded-lg font-semibold text-sm disabled:opacity-30 hover:bg-[#004488] transition"
                >
                  ← Previous
                </button>

                <span className="text-sm text-gray-500 font-medium">
                  {answeredCount} of {test.questions.length} answered
                </span>

                {currentIdx === test.questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition shadow-md disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Exam"}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-6 py-3 bg-[#003366] text-white rounded-lg font-semibold text-sm hover:bg-[#004488] transition"
                  >
                    Next →
                  </button>
                )}
              </div>
            </>
          )}
        </main>

        {/* RIGHT PANEL — Question Grid Navigation */}
        <aside className="w-full lg:w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-inner">
          {/* Grid — grouped by subject for JAMB */}
          {isJamb && subjects.length > 1 ? (
            subjects.map((subject) => {
              const qs = subjectGroups[subject];
              const stats = getSubjectStats(subject);
              return (
                <div key={subject} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      {subject}
                    </span>
                    <span className="text-xs text-gray-500">
                      {stats.answered}/{stats.total}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {qs.map((q) => {
                      const isActive = q.globalIdx === currentIdx;
                      const isDone = !!answers[q.id];
                      const isFlag = !!flagged[q.id];
                      let bgColor = "bg-white border-gray-300 text-gray-600";
                      if (isDone)
                        bgColor = "bg-green-500 border-green-500 text-white";
                      if (isFlag)
                        bgColor = "bg-orange-400 border-orange-400 text-white";
                      if (isActive)
                        bgColor += " ring-2 ring-[#003366] ring-offset-1";
                      return (
                        <button
                          key={q.id}
                          onClick={() =>
                            handleSubjectQuestionClick(q.globalIdx)
                          }
                          className={`aspect-square rounded border text-xs font-bold flex items-center justify-center transition-all hover:opacity-80 ${bgColor}`}
                        >
                          {q.globalIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <div className="bg-[#003366] text-white px-3 py-2 rounded-t-lg text-sm font-bold mb-0">
                Question Navigation
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-3 mb-4">
                <div className="grid grid-cols-5 gap-2">
                  {test.questions.map((q, i) => {
                    const isActive = i === currentIdx;
                    const isDone = !!answers[q.id];
                    const isFlag = !!flagged[q.id];
                    let bgColor = "bg-white border-gray-300 text-gray-600";
                    if (isDone)
                      bgColor = "bg-green-500 border-green-500 text-white";
                    if (isFlag)
                      bgColor = "bg-orange-400 border-orange-400 text-white";
                    if (isActive)
                      bgColor += " ring-2 ring-[#003366] ring-offset-1";
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(i)}
                        className={`aspect-square rounded border text-xs font-bold flex items-center justify-center transition-all hover:opacity-80 ${bgColor}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Legend */}
          <div className="space-y-2 text-xs mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500 inline-block" />
              <span className="text-gray-600">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-orange-400 inline-block" />
              <span className="text-gray-600">
                Flagged ({Object.values(flagged).filter(Boolean).length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-white border border-gray-300 inline-block" />
              <span className="text-gray-600">
                Unanswered ({unansweredCount})
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition shadow-md disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </aside>
      </div>

      {/* ═══ CALCULATOR ═══ */}
      {showCalculator && (
        <CBTCalculator onClose={() => setShowCalculator(false)} />
      )}

      {/* ═══ LOCKDOWN WARNING OVERLAY ═══ */}
      {showLockdownWarning && test?.enable_lockdown && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Fullscreen Required
            </h2>
            <p className="text-gray-600 mb-2">
              You have exited fullscreen mode. This is a proctored exam and
              fullscreen is required.
            </p>
            <p className="text-sm text-red-600 font-medium mb-6">
              Exit count: {lockdownExitCount} / 3 — Further exits may be
              flagged.
            </p>
            <button
              onClick={returnToFullscreen}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-xl font-bold hover:bg-[#004488] transition shadow-lg"
            >
              <Maximize size={18} />
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* ═══ SUBMIT CONFIRMATION MODAL ═══ */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Submit Exam?</h2>
            </div>
            <p className="text-gray-600 mb-2">
              You have{" "}
              <strong className="text-red-600">{unansweredCount}</strong>{" "}
              unanswered question{unansweredCount > 1 ? "s" : ""}.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Once submitted, you cannot change your answers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CBTSimulator;
