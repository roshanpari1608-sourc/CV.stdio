import React, { useState } from "react";
import { 
  Sparkles, CheckCircle, AlertTriangle, Lightbulb, 
  Target, Briefcase, RefreshCw, ChevronRight, Check,
  AlertCircle, Copy, Info, TrendingUp, HelpCircle
} from "lucide-react";
import { CVData, AIReviewResult } from "../types";

interface AIAssistantProps {
  cvData: CVData;
  onApplyTailoredSummary: (newSummary: string) => void;
}

export default function AIAssistant({ cvData, onApplyTailoredSummary }: AIAssistantProps) {
  // Audit scores state
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Job tailoring state
  const [jobDescription, setJobDescription] = useState("");
  const [tailoringResult, setTailoringResult] = useState<{
    tailoredSummary: string;
    focusChecklist: string[];
    matchingKeywords: string[];
  } | null>(null);
  const [loadingTailor, setLoadingTailor] = useState(false);
  const [tailorError, setTailorError] = useState("");
  const [copiedText, setCopierText] = useState<string | null>(null);

  // Trigger ATS compatibility scan
  const triggerResumeAudit = async () => {
    setLoadingReview(true);
    setReviewError("");
    try {
      const response = await fetch("/api/ai/review-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData })
      });

      if (!response.ok) {
        throw new Error("Failed to audit resume.");
      }

      const data = await response.json();
      setReviewResult(data);
    } catch (err: any) {
      console.error(err);
      setReviewError("AI Audit server error. Verify your internet connection and make sure your GEMINI_API_KEY is updated.");
    } finally {
      setLoadingReview(false);
    }
  };

  // Trigger job tailoring recommendations
  const triggerJobTailoring = async () => {
    if (!jobDescription.trim()) {
      setTailorError("Please insert a target job description code or post text to perform tailoring match.");
      return;
    }

    setLoadingTailor(true);
    setTailorError("");
    setTailoringResult(null);

    try {
      const response = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, jobDescription })
      });

      if (!response.ok) {
        throw new Error("Tailoring request failed.");
      }

      const data = await response.json();
      setTailoringResult(data);
    } catch (err: any) {
      console.error(err);
      setTailorError("Job tailor server error. Please retry shortly.");
    } finally {
      setLoadingTailor(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopierText(id);
    setTimeout(() => setCopierText(null), 2000);
  };

  // Custom visual components for scorecard ring
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 stroke-emerald-500";
    if (score >= 65) return "text-amber-500 stroke-amber-500";
    return "text-red-500 stroke-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-emerald-50 text-emerald-800 border-emerald-100";
    if (score >= 65) return "bg-amber-50 text-amber-800 border-amber-100";
    return "bg-red-50 text-red-800 border-red-100";
  };

  return (
    <div id="ai-assistant-panel" className="space-y-5">
      {/* SECTION 1: RESUME ATS AUDITOR */}
      <div id="ats-audit-card" className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ATS Analyzer</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
            Version 2.5 flash
          </span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800">Review ATS Compatibility Index</h3>
          <p className="text-xs text-slate-500 leading-normal mt-0.5">
            Evaluate formatting strength, metric alignments, verb choices, and keyword densities before applying to active jobs.
          </p>
        </div>

        {!reviewResult ? (
          <button
            id="btn-scan-resume"
            type="button"
            disabled={loadingReview}
            onClick={triggerResumeAudit}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-150-50"
          >
            {loadingReview ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing Entire Curriculum Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze ATS Curriculum Index
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-50">
            {/* SCORE GAUGE */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-slate-200 fill-none"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className={`fill-none progress-dash ${getScoreColor(reviewResult.score)}`}
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - reviewResult.score / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-850">
                  {reviewResult.score}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full inline-block border ${getScoreBg(reviewResult.score)}`}>
                  {reviewResult.score >= 85 ? "Excellent Match" : reviewResult.score >= 65 ? "Good Foundation" : "Needs Optimization"}
                </div>
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  {reviewResult.scoreExplanation}
                </p>
              </div>
            </div>

            {/* STRENGTHS */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Key Strengths:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 pl-1">
                {reviewResult.positives.map((pos, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* IMPROVEMENTS */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-amber-700 tracking-wider uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Actionable Fixes:
              </h4>
              <ul className="text-xs text-slate-605 space-y-1 pl-1">
                {reviewResult.improvements.map((imp, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ATS KEYWORDS SUGGESTED */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Target ATS Keywords to Add:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {reviewResult.suggestedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-150 transition px-2 py-0.5 rounded cursor-help"
                    title="Copy keyword"
                    onClick={() => copyToClipboard(kw, `kw-${idx}`)}
                  >
                    {copiedText === `kw-${idx}` ? "Copied! ✓" : `+ ${kw}`}
                  </span>
                ))}
              </div>
            </div>

            <button
              id="re-scan-resume-btn"
              type="button"
              disabled={loadingReview}
              onClick={triggerResumeAudit}
              className="w-full text-center py-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReview ? "animate-spin" : ""}`} />
              Re-Scan Updated Curriculum
            </button>
          </div>
        )}

        {reviewError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{reviewError}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: ADAPT RESUME FOR CHOSEN JOB DESCRIPTION */}
      <div id="ats-tailor-card" className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Pillar Matching</span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800">Tailor CV for Active Roles</h3>
          <p className="text-xs text-slate-500 leading-normal mt-0.5">
            Paste details of raw postings. Gemini will restructure summaries, isolate key skill matches, and generate tailored paragraphs.
          </p>
        </div>

        <textarea
          id="textarea-job-description"
          rows={5}
          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:bg-white transition"
          placeholder="Paste requirements, description, or bullet highlights from LinkedIn/Indeed here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button
          id="btn-tailor-cv"
          type="button"
          disabled={loadingTailor}
          onClick={triggerJobTailoring}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
        >
          {loadingTailor ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Recalculating Job Fit...
            </>
          ) : (
            <>
              <Briefcase className="w-4 h-4" />
              Tailor Resume to posting
            </>
          )}
        </button>

        {tailorError && (
          <div className="p-3 bg-red-50 text-red-650 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{tailorError}</span>
          </div>
        )}

        {tailoringResult && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            {/* TAILORED SUMMARY SUGGESTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Tailored CV Summary Suggestion:</span>
                <button
                  id="action-apply-tailor-summary"
                  type="button"
                  onClick={() => onApplyTailoredSummary(tailoringResult.tailoredSummary)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                >
                  Apply to CV Summary
                </button>
              </div>
              <div className="p-3 bg-teal-50/20 border border-teal-55/60 rounded-xl relative group">
                <p className="text-xs text-slate-600 leading-relaxed text-justify pr-6">
                  {tailoringResult.tailoredSummary}
                </p>
                <button
                  id="action-copy-tailor-summary"
                  type="button"
                  onClick={() => copyToClipboard(tailoringResult.tailoredSummary, "tailored-sum")}
                  className="absolute right-2 top-2 p-1.5 bg-white/80 border border-slate-205 rounded hover:bg-white text-slate-500"
                  title="Copy custom summary text"
                >
                  {copiedText === "tailored-sum" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* STRATEGIC CHECKLIST */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Core Focus Priority Checklist:</span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {tailoringResult.focusChecklist.map((focus, idx) => (
                  <li key={idx} className="flex gap-2 items-start bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="p-0.5 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold block shrink-0 mt-0.5">✓</span>
                    <span className="leading-tight">{focus}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KEYWORD GAP INSERTS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Specific Terms From Posting found:</span>
              <div className="flex flex-wrap gap-1.5">
                {tailoringResult.matchingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-100 flex items-center gap-1 cursor-pointer hover:bg-teal-100 transition"
                    onClick={() => copyToClipboard(kw, `tailor-kw-${idx}`)}
                  >
                    {copiedText === `tailor-kw-${idx}` ? "Copied! ✓" : kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
