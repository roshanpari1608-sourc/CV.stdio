import React, { useState } from "react";
import { 
  Sparkles, Printer, Briefcase, GraduationCap, Layout, 
  Award, RefreshCw, Layers, Sliders, CheckSquare, ChevronRight, Check, PlaySquare, FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CVData, ResumeSettings } from "./types";
import { DEFAULT_EMPTY_STATE, STUDENT_MOCK_DATA, PROFESSIONAL_MOCK_DATA } from "./data/mockTemplates";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import AIAssistant from "./components/AIAssistant";

export default function App() {
  // Main State holding the user curriculum details
  // Defaults to the premium student model so the builder opens fully illustrated and stunning right away!
  const [cvData, setCvData] = useState<CVData>(STUDENT_MOCK_DATA);

  // Layout settings (template, colors, spacing, typography)
  const [settings, setSettings] = useState<ResumeSettings>({
    template: "modern",
    primaryColor: "#1e3a8a", // Navy
    fontFamily: "sans",
    spacing: "normal",
    sectionsOrder: ["summary", "education", "experience", "projects", "skills", "languages", "certifications"]
  });

  // Sidebar tab on of the preview panel ("preview" | "ai")
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"preview" | "ai">("preview");

  // Mobile/Tablet primary view mode state ("edit" | "preview")
  const [mobileActiveTab, setMobileActiveTab] = useState<"edit" | "preview">("edit");

  // State to track if an action is showing a feedback popup
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const displayNotification = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  // Switch demo data presets
  const handleLoadPreset = (type: "student" | "professional") => {
    if (type === "student") {
      setCvData(STUDENT_MOCK_DATA);
      setSettings(prev => ({
        ...prev,
        template: "modern",
        primaryColor: "#1e3a8a" // Slate Royal
      }));
      displayNotification("Loaded Student CV sample templates!");
    } else {
      setCvData(PROFESSIONAL_MOCK_DATA);
      setSettings(prev => ({
        ...prev,
        template: "classic",
        primaryColor: "#065f46" // Forest Emerald
      }));
      displayNotification("Loaded Working Professional Resume template!");
    }
  };

  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear all inputs and start fresh?")) {
      setCvData(DEFAULT_EMPTY_STATE);
      displayNotification("Curriculum fields reset.");
    }
  };

  // Callback to allow AI assistant to directly update summary with tailored content
  const applyTailoredSummary = (newSummary: string) => {
    setCvData(prev => ({
      ...prev,
      summary: newSummary
    }));
    setActiveWorkspaceTab("preview");
    setMobileActiveTab("preview");
    displayNotification("Successfully applied Gemini-tailored summary to your Resume!");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col antialiased select-none print:bg-white print:min-h-0 print:text-black">
      
      {/* 🌟 GLOBAL WEB NOTIFICATION BANNER 🌟 */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -45 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -45 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-neutral-900 border border-[#D4FF00]/30 text-white font-bold text-xs rounded-none shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D4FF00] shrink-0 animate-pulse" />
            <span className="uppercase tracking-wider">{activeNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER / NAVIGATION BAR */}
      <header id="navigation-bar" className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 z-40 px-6 py-4.5 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo Info inside dark block */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-[#D4FF00] text-black rounded-none font-black text-lg tracking-tighter uppercase select-none">
              CV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">CV.STUDIO</h1>
                <span className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-[#D4FF00] text-[9px] font-extrabold px-1.5 py-0.5 rounded-none flex items-center gap-0.5 font-mono tracking-widest">
                  ★ AI ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold font-mono mt-1">High-impact document compilation engine</p>
            </div>
          </div>

          {/* Quick Preset Toolbar with flat buttons */}
          <div id="switch-prefills-toolbar" className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mr-1.5 font-mono hidden sm:inline">DEMO SAMPLES:</span>
            <button
              id="toolbar-load-student-preset"
              type="button"
              onClick={() => handleLoadPreset("student")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#D4FF00] text-white hover:text-black border border-white/10 hover:border-transparent rounded-none text-xs font-bold uppercase tracking-wider transition-all duration-155"
              title="Loads high value undergraduate CS layout example"
            >
              🎓 Student Model
            </button>
            <button
              id="toolbar-load-pro-preset"
              type="button"
              onClick={() => handleLoadPreset("professional")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#D4FF00] text-white hover:text-black border border-white/10 hover:border-transparent rounded-none text-xs font-bold uppercase tracking-wider transition-all duration-155"
              title="Loads results oriented Marketing supervisor details example"
            >
              💼 Professional Model
            </button>
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
            <button
              id="toolbar-clear-all"
              type="button"
              onClick={handleClearForm}
              className="px-3 py-1.5 text-xs text-white/55 hover:text-white border border-white/10 hover:border-white/30 rounded-none font-bold uppercase tracking-wider transition-all"
            >
              🧹 Clear All
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE & TABLET PORT PANEL TOGGLES - STICKY BELOW HEADER, HIDDEN ON DESKTOPS */}
      <div className="lg:hidden sticky top-[72px] bg-[#0A0A0A] z-30 px-6 py-3 border-b border-white/10 flex gap-2 print:hidden select-none">
        <button
          id="mobile-toggle-edit"
          type="button"
          onClick={() => setMobileActiveTab("edit")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-none border text-center font-mono ${
            mobileActiveTab === "edit"
              ? "bg-[#D4FF00] text-black border-transparent shadow-[0_4px_12px_rgba(212,255,0,0.15)]"
              : "bg-white/5 text-white/50 border-white/10 hover:text-white"
          }`}
        >
          ✍️ Edit Form
        </button>
        <button
          id="mobile-toggle-preview"
          type="button"
          onClick={() => setMobileActiveTab("preview")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-none border text-center font-mono ${
            mobileActiveTab === "preview"
              ? "bg-[#D4FF00] text-black border-transparent shadow-[0_4px_12px_rgba(212,255,0,0.15)]"
              : "bg-white/5 text-white/50 border-white/10 hover:text-white"
          }`}
        >
          👁️ {activeWorkspaceTab === "preview" ? "A4 Preview" : "AI Audit"}
        </button>
      </div>

      {/* DASHBOARD WORKSPACE GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:p-0">
        
        {/* LEFT COLUMN: INTERACTIVE CONTRACT FORM (Scrollable area) */}
        <section className={`lg:col-span-5 space-y-5 print:hidden lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto pr-0 lg:pr-1 pb-10 ${
          mobileActiveTab === "edit" ? "block" : "hidden lg:block"
        }`}>
          <div className="bg-[#121212] border border-white/10 p-6 rounded-none space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black tracking-tighter text-[#D4FF00] leading-none">01</span>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Curriculum Details
                </h2>
                <p className="text-[10px] text-white/40 font-mono tracking-wider uppercase">Fill your achievements in edit mode</p>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed pt-1 select-text">
              Configure parameters such as roles, education achievements, code skills, and certifications below.
            </p>
          </div>
          
          <ResumeForm
            cvData={cvData}
            onChange={(newData) => setCvData(newData)}
            onSelectPrefill={(type) => handleLoadPreset(type)}
          />
        </section>

        {/* RIGHT COLUMN: WORKSPACE LAYOUT (TABS: PREVIEW & AI ASSISTANT) */}
        <section className={`lg:col-span-7 space-y-5 lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto pb-10 px-0.5 print:max-h-none print:pb-0 print:col-span-12 print:block ${
          mobileActiveTab === "preview" ? "block w-full print:block" : "hidden lg:block print:block"
        }`}>
          
          {/* Workspace Tab Bar Selector */}
          <div className="bg-[#121212] border border-white/10 p-1 flex items-center justify-between gap-2 shadow-none print:hidden rounded-none">
            <div className="flex gap-2">
              <button
                id="tab-button-preview"
                type="button"
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeWorkspaceTab === "preview"
                    ? "border-[#D4FF00] text-[#D4FF00]"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
                onClick={() => setActiveWorkspaceTab("preview")}
              >
                02 Setup & PDF Preview
              </button>
              <button
                id="tab-button-ai"
                type="button"
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeWorkspaceTab === "ai"
                    ? "border-[#D4FF00] text-[#D4FF00]"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
                onClick={() => setActiveWorkspaceTab("ai")}
              >
                03 AI ATS Benchmarks
              </button>
            </div>
            
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest hidden sm:block mr-3 font-mono">
              Live A4 sheet Render
            </div>
          </div>

          {/* Tab Pages */}
          <div className="print:p-0">
            {activeWorkspaceTab === "preview" ? (
              <ResumePreview
                cvData={cvData}
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
              />
            ) : (
              <AIAssistant
                cvData={cvData}
                onApplyTailoredSummary={applyTailoredSummary}
              />
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 py-5 text-center text-xs text-white/30 print:hidden mt-auto uppercase tracking-wider font-mono">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <p className="font-bold">
            Founded by <strong className="text-[#D4FF00] font-black">Roshan Kumar Sahu</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
