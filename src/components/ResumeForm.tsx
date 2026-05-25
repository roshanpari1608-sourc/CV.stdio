import React, { useState } from "react";
import { 
  User, Briefcase, Plus, Trash2, Wand2, GraduationCap, 
  Code, Award, Globe, Sparkles, ChevronDown, ChevronUp,
  ExternalLink, FileText, CheckCircle2, AlertCircle, RefreshCw, Trophy,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CVData, Education, WorkExperience, Project, SkillCategory, Language, Certification, Achievement } from "../types";

interface ResumeFormProps {
  cvData: CVData;
  onChange: (newData: CVData) => void;
  onSelectPrefill: (type: "student" | "professional") => void;
}

export default function ResumeForm({ cvData, onChange, onSelectPrefill }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  
  // State for the AI Summary Generator helper
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);
  const [summaryKeywords, setSummaryKeywords] = useState("");
  const [summaryIndustry, setSummaryIndustry] = useState("");
  const [aiSummaries, setAiSummaries] = useState<{ option1: string; option2: string; option3: string } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // States for polishing bullets
  const [polishingState, setPolishingState] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setActiveTab(activeTab === section ? "" : section);
  };

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value
      }
    });
  };

  const updateSummary = (value: string) => {
    onChange({ ...cvData, summary: value });
  };

  // Helper to generate IDs
  const generateId = () => "id_" + Math.random().toString(36).substr(2, 9);

  // Education Handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      relevantCoursework: "",
      honors: ""
    };
    onChange({
      ...cvData,
      education: [...cvData.education, newEdu]
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange({
      ...cvData,
      education: cvData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...cvData,
      education: cvData.education.filter(edu => edu.id !== id)
    });
  };

  // Work Experience Handlers
  const addWorkExperience = () => {
    const newWork: WorkExperience = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: ["Developed key project milestones collaboratively with my team."]
    };
    onChange({
      ...cvData,
      workExperience: [...cvData.workExperience, newWork]
    });
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    onChange({
      ...cvData,
      workExperience: cvData.workExperience.map(work => 
        work.id === id ? { ...work, [field]: value } : work
      )
    });
  };

  const removeWorkExperience = (id: string) => {
    onChange({
      ...cvData,
      workExperience: cvData.workExperience.filter(work => work.id !== id)
    });
  };

  const addWorkBullet = (workId: string) => {
    onChange({
      ...cvData,
      workExperience: cvData.workExperience.map(work => {
        if (work.id === workId) {
          return {
            ...work,
            bullets: [...work.bullets, "New achievement bullet point."]
          };
        }
        return work;
      })
    });
  };

  const updateWorkBullet = (workId: string, index: number, value: string) => {
    onChange({
      ...cvData,
      workExperience: cvData.workExperience.map(work => {
        if (work.id === workId) {
          const newBullets = [...work.bullets];
          newBullets[index] = value;
          return { ...work, bullets: newBullets };
        }
        return work;
      })
    });
  };

  const removeWorkBullet = (workId: string, index: number) => {
    onChange({
      ...cvData,
      workExperience: cvData.workExperience.map(work => {
        if (work.id === workId) {
          const newBullets = work.bullets.filter((_, i) => i !== index);
          return { ...work, bullets: newBullets.length ? newBullets : [""] };
        }
        return work;
      })
    });
  };

  // AI Bullet polisher request
  const polishBulletPoint = async (experienceId: string, index: number, isProject = false) => {
    const uniqueKey = `${isProject ? "p" : "w"}-${experienceId}-${index}`;
    if (polishingState[uniqueKey]) return;

    setPolishingState(prev => ({ ...prev, [uniqueKey]: true }));

    try {
      let currentBullet = "";
      let positionContext = "";
      let companyContext = "";

      if (isProject) {
        const proj = cvData.projects.find(p => p.id === experienceId);
        if (proj) {
          currentBullet = proj.bullets[index];
          positionContext = proj.role;
          companyContext = proj.name;
        }
      } else {
        const exp = cvData.workExperience.find(w => w.id === experienceId);
        if (exp) {
          currentBullet = exp.bullets[index];
          positionContext = exp.position;
          companyContext = exp.company;
        }
      }

      const response = await fetch("/api/ai/polish-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: currentBullet,
          position: positionContext,
          company: companyContext,
          targetType: cvData.resumeRoleType
        })
      });

      if (!response.ok) {
        throw new Error("HTTP failure polishing experience bullet.");
      }

      const data = await response.json();
      if (data.polished) {
        if (isProject) {
          onChange({
            ...cvData,
            projects: cvData.projects.map(p => {
              if (p.id === experienceId) {
                const newB = [...p.bullets];
                newB[index] = data.polished;
                return { ...p, bullets: newB };
              }
              return p;
            })
          });
        } else {
          onChange({
            ...cvData,
            workExperience: cvData.workExperience.map(w => {
              if (w.id === experienceId) {
                const newB = [...w.bullets];
                newB[index] = data.polished;
                return { ...w, bullets: newB };
              }
              return w;
            })
          });
        }
      }
    } catch (e) {
      console.error(e);
      alert("Notice: Could not contact AI services. The service might be booting. Please verify your GEMINI_API_KEY in Settings > Secrets if this keeps failing.");
    } finally {
      setPolishingState(prev => ({ ...prev, [uniqueKey]: false }));
    }
  };

  // Projects Handlers
  const addProject = () => {
    const newProj: Project = {
      id: generateId(),
      name: "",
      role: "",
      technologies: "",
      startDate: "",
      endDate: "",
      url: "",
      bullets: ["Engineered the core routing architectures for the solution."]
    };
    onChange({
      ...cvData,
      projects: [...cvData.projects, newProj]
    });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    onChange({
      ...cvData,
      projects: cvData.projects.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...cvData,
      projects: cvData.projects.filter(p => p.id !== id)
    });
  };

  const addProjectBullet = (projId: string) => {
    onChange({
      ...cvData,
      projects: cvData.projects.map(p => {
        if (p.id === projId) {
          return {
            ...p,
            bullets: [...p.bullets, "New collaborative achievement bullet point."]
          };
        }
        return p;
      })
    });
  };

  const updateProjectBullet = (projId: string, index: number, value: string) => {
    onChange({
      ...cvData,
      projects: cvData.projects.map(p => {
        if (p.id === projId) {
          const newBullets = [...p.bullets];
          newBullets[index] = value;
          return { ...p, bullets: newBullets };
        }
        return p;
      })
    });
  };

  const removeProjectBullet = (projId: string, index: number) => {
    onChange({
      ...cvData,
      projects: cvData.projects.map(p => {
        if (p.id === projId) {
          const newBullets = p.bullets.filter((_, i) => i !== index);
          return { ...p, bullets: newBullets.length ? newBullets : [""] };
        }
        return p;
      })
    });
  };

  // Skills Handlers
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: generateId(),
      category: "Tools & Frameworks",
      skills: ""
    };
    onChange({
      ...cvData,
      skills: [...cvData.skills, newCat]
    });
  };

  const updateSkillCategory = (id: string, field: keyof SkillCategory, value: string) => {
    onChange({
      ...cvData,
      skills: cvData.skills.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      )
    });
  };

  const removeSkillCategory = (id: string) => {
    onChange({
      ...cvData,
      skills: cvData.skills.filter(s => s.id !== id)
    });
  };

  // Languages Handlers
  const addLanguage = () => {
    const newLang: Language = {
      id: generateId(),
      name: "",
      proficiency: "Professional"
    };
    onChange({
      ...cvData,
      languages: [...cvData.languages, newLang]
    });
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    onChange({
      ...cvData,
      languages: cvData.languages.map(l => 
        l.id === id ? { ...l, [field]: value } : l
      )
    });
  };

  const removeLanguage = (id: string) => {
    onChange({
      ...cvData,
      languages: cvData.languages.filter(l => l.id !== id)
    });
  };

  // Certifications Handlers
  const addCertification = () => {
    const newCert: Certification = {
      id: generateId(),
      name: "",
      issuer: "",
      year: ""
    };
    onChange({
      ...cvData,
      certifications: [...cvData.certifications, newCert]
    });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onChange({
      ...cvData,
      certifications: cvData.certifications.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...cvData,
      certifications: cvData.certifications.filter(c => c.id !== id)
    });
  };

  // Achievements Handlers
  const addAchievement = () => {
    const newAch: Achievement = {
      id: generateId(),
      title: "",
      issuer: "",
      year: "",
      description: ""
    };
    onChange({
      ...cvData,
      achievements: [...(cvData.achievements || []), newAch]
    });
  };

  const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
    onChange({
      ...cvData,
      achievements: (cvData.achievements || []).map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    });
  };

  const removeAchievement = (id: string) => {
    onChange({
      ...cvData,
      achievements: (cvData.achievements || []).filter(a => a.id !== id)
    });
  };

  // Call API for Summary Suggestion
  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    setSummaryError("");
    setAiSummaries(null);

    try {
      const response = await fetch("/api/ai/suggest-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: cvData.personalInfo,
          resumeRoleType: cvData.resumeRoleType,
          keyHighlights: summaryKeywords,
          industryFocus: summaryIndustry || cvData.personalInfo.headline
        })
      });

      if (!response.ok) {
        throw new Error("Summary API failed.");
      }

      const data = await response.json();
      setAiSummaries(data);
    } catch (err: any) {
      console.error(err);
      setSummaryError("Failed to connect with Gemini AI summary generator. Ensure your key is properly set in the Secrets manager.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const selectSuggestedSummary = (summary: string) => {
    updateSummary(summary);
    setShowAiSummaryModal(false);
    setAiSummaries(null);
    setSummaryKeywords("");
    setSummaryIndustry("");
  };

  return (
    <div id="cv-form-container" className="space-y-4">
      {/* Target Role Selector Toolbar */}
      <div id="role-selector-bar" className="bg-[#121212] border border-white/10 p-5 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4FF00] font-mono">OBJECTIVE PRE-SET</span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">Customize Curriculum Focus:</h3>
        </div>
        <div className="flex bg-neutral-900 p-1 rounded-none border border-white/15 self-start sm:self-center">
          <button
            id="switch-student-btn"
            type="button"
            className={`px-4 py-1.5 rounded-none text-xs font-black uppercase tracking-wider transition-all ${
              cvData.resumeRoleType === "student"
                ? "bg-[#D4FF00] text-black"
                : "text-white/50 hover:text-white"
            }`}
            onClick={() => {
              onSelectPrefill("student");
            }}
          >
            Student Mode
          </button>
          <button
            id="switch-pro-btn"
            type="button"
            className={`px-4 py-1.5 rounded-none text-xs font-black uppercase tracking-wider transition-all ${
              cvData.resumeRoleType === "professional"
                ? "bg-[#D4FF00] text-black"
                : "text-white/50 hover:text-white"
            }`}
            onClick={() => {
              onSelectPrefill("professional");
            }}
          >
            Pro Mode
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {/* 1. PERSONAL INFORMATION */}
        <div id="section-personal" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-personal"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("personal")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 block">
                <User className="w-4.5 h-4.5" />
              </span>
              <div className="text-left">
                <h4 className="text-sm font-semibold">Personal Details</h4>
                <p className="text-xs text-slate-400">Name, contact numbers, LinkedIn & Portfolio profiles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "personal" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "personal" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "personal" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "personal" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-4">
                  
                  {/* PROFILE PICTURE DRAG / UPLOAD UTILITY */}
                  <div 
                    id="personal-image-card"
                    className="p-5 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]"
                    style={{ backgroundColor: "#000000" }}
                  >
                    <div className="relative group w-20 h-20 rounded-xl bg-neutral-900 border-2 border-dashed border-neutral-800 hover:border-indigo-500 hover:bg-neutral-900/50 transition duration-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {cvData.personalInfo.photoUrl ? (
                        <>
                          <img 
                            src={cvData.personalInfo.photoUrl} 
                            alt="Profile Avatar" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center text-white backdrop-blur-xs">
                            <button
                              type="button"
                              onClick={() => updatePersonalInfo("photoUrl", "")}
                              className="p-1 px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold bg-red-600 hover:bg-red-500 rounded-md transition duration-150 shadow-sm"
                              title="Delete Profile Image"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center">
                          <User className="w-8 h-8 stroke-[1.25] text-slate-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full space-y-3.5 text-center sm:text-left">
                      <div>
                        <h5 className="text-[14px] font-extrabold text-white leading-snug" style={{ color: "#ffffff" }}>Profile headshot</h5>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: "#989898" }}>Include an elegant, high-contrast display headshot on your resume.</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {/* Interactive File Picker */}
                        <label 
                          style={{ backgroundColor: "#d4ff00", color: "#000000", borderColor: "#926767" }}
                          className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold active:scale-[0.98] border rounded-lg transition duration-200 shadow-xs shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" style={{ color: "#000000" }} />
                          <span style={{ color: "#ff0000" }}>
                            Upload File
                          </span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === "string") {
                                    updatePersonalInfo("photoUrl", reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {/* Paste Url input */}
                        <div className="relative flex-1 w-full flex items-center">
                          <input
                            type="text"
                            placeholder="Or paste direct image link..."
                            className="w-full px-3.5 py-1.5 pr-14 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition duration-155"
                            value={cvData.personalInfo.photoUrl || ""}
                            onChange={(e) => updatePersonalInfo("photoUrl", e.target.value)}
                          />
                          {cvData.personalInfo.photoUrl && (
                            <button
                              type="button"
                              onClick={() => updatePersonalInfo("photoUrl", "")}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[9px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
                            >
                              CLEAR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form inputs grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                    <input
                      id="input-firstName"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="Jane"
                      value={cvData.personalInfo.firstName}
                      onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                    <input
                      id="input-lastName"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="Doe"
                      value={cvData.personalInfo.lastName}
                      onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Professional Title or Degree Focus</label>
                    <input
                      id="input-headline"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder={cvData.resumeRoleType === "student" ? "Computer Science Undergraduate" : "Senior Software Engineer"}
                      value={cvData.personalInfo.headline}
                      onChange={(e) => updatePersonalInfo("headline", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                    <input
                      id="input-email"
                      type="email"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="jane.doe@example.com"
                      value={cvData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                    <input
                      id="input-phone"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="+1 (555) 012-3456"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Location (City, State)</label>
                    <input
                      id="input-location"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="Austin, TX"
                      value={cvData.personalInfo.location}
                      onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Websites / Personal Link</label>
                    <input
                      id="input-website"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="https://janedoe.dev"
                      value={cvData.personalInfo.website}
                      onChange={(e) => updatePersonalInfo("website", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">LinkedIn Profile Link</label>
                    <input
                      id="input-linkedin"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="linkedin.com/in/janedoe"
                      value={cvData.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">GitHub Link (Recommended for Students)</label>
                    <input
                      id="input-github"
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                      placeholder="github.com/janedoe"
                      value={cvData.personalInfo.github}
                      onChange={(e) => updatePersonalInfo("github", e.target.value)}
                    />
                  </div>
                </div>

                {/* Save Section Button */}
                <div className="flex justify-end pt-3 border-t border-slate-100/80">
                  <button
                    id="save-personal-btn"
                    type="button"
                    onClick={() => toggleSection("personal")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Section</span>
                  </button>
                </div>

              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. PROFILE SUMMARY & AI SUGGESTION */}
        <div id="section-summary" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-summary"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("summary")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-teal-50 text-teal-600 block">
                <FileText className="w-4.5 h-4.5" />
              </span>
              <div className="text-left">
                <h4 className="text-sm font-semibold">Professional Summary / Objective</h4>
                <p className="text-xs text-slate-400">Brief narrative showcasing your target value or drive</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "summary" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "summary" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "summary" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "summary" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Your Summary Text:</span>
                    <button
                      id="ai-summary-magic-btn"
                      type="button"
                      onClick={() => setShowAiSummaryModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Draft with Gemini AI
                    </button>
                  </div>
                  <textarea
                    id="textarea-summary"
                    rows={4}
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                    placeholder="E.g., Motivated business administration student with exceptional analytical skills. Experienced in handling fast team projects and ready to contribute..."
                    value={cvData.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                  />
                  <p className="text-xs text-slate-400">
                    💡 <span className="font-semibold">Student Tip:</span> If you don't have experience, call it your "Career Objective" and highlight high curiosity, course achievements, or project leadership.
                  </p>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-summary-btn"
                      type="button"
                      onClick={() => toggleSection("summary")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. EDUCATION */}
        <div id="section-education" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-education"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("education")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-orange-50 text-orange-600 block">
                <GraduationCap className="w-4.5 h-4.5" />
              </span>
              <div className="text-left font-sans">
                <h4 className="text-sm font-extrabold text-indigo-950 tracking-tight">Education History</h4>
                <p className="text-xs text-indigo-650/80 font-medium">Universities, majors, GPAs, coursework and honors</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "education" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "education" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "education" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "education" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-4">
                  {cvData.education.map((edu, idx) => (
                    <div 
                      id={`edu-card-${edu.id}`} 
                      key={edu.id} 
                      className="p-5 bg-black text-white border border-slate-800 rounded-xl relative space-y-4 shadow-md transition-all duration-200"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <button
                        id={`delete-edu-${edu.id}`}
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Delete Education Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-sans">
                        Education #{idx + 1}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">School / University</label>
                          <input
                            id={`input-school-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="University of Science"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Location (City, ST)</label>
                          <input
                            id={`input-edu-location-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Boston, MA"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Degree Program</label>
                          <input
                            id={`input-degree-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Bachelor of Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Major / Field of Study</label>
                          <input
                            id={`input-field-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Computer Architecture"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                          <input
                            id={`input-edu-start-${edu.id}`}
                            type="month"
                            className="w-full px-3 py-2 text-sm text-white border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            style={{ backgroundColor: "#000000" }}
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {edu.current ? "Expected Graduation" : "End Date"}
                          </label>
                          <input
                            id={`input-edu-end-${edu.id}`}
                            type="month"
                            disabled={edu.current}
                            className="w-full px-3 py-2 text-sm text-white border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition disabled:bg-neutral-950 disabled:opacity-40"
                            style={{ backgroundColor: "#000000" }}
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2 py-1">
                          <input
                            id={`input-edu-current-${edu.id}`}
                            type="checkbox"
                            className="rounded bg-neutral-900 border-neutral-800 text-indigo-500 focus:ring-indigo-500"
                            checked={edu.current}
                            onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                          />
                          <label htmlFor={`input-edu-current-${edu.id}`} className="text-xs text-slate-300 font-medium cursor-pointer select-none">
                            I am currently enrolled/studying here
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">GPA (Highly recommended for students!)</label>
                          <input
                            id={`input-gpa-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="3.8 / 4.0 or Magna Cum Laude"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Relevant Coursework (Separated by commas)</label>
                          <input
                            id={`input-coursework-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Data Structures, Algorithms, Linear Algebra"
                            value={edu.relevantCoursework}
                            onChange={(e) => updateEducation(edu.id, "relevantCoursework", e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Honors/Activities (Separated by commas)</label>
                          <input
                            id={`input-honors-${edu.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Dean's List, CS Society President, Hackathon Winner"
                            value={edu.honors}
                            onChange={(e) => updateEducation(edu.id, "honors", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    id="add-edu-btn"
                    type="button"
                    onClick={addEducation}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 w-full justify-center py-2.5 rounded-lg border border-dashed border-indigo-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Another School/Education Block
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-education-btn"
                      type="button"
                      onClick={() => toggleSection("education")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. WORK EXPERIENCE */}
        <div id="section-experience" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-experience"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("experience")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 block">
                <Briefcase className="w-4.5 h-4.5" />
              </span>
              <div className="text-left font-sans">
                <h4 className="text-sm font-extrabold text-indigo-950 tracking-tight">Work Experience</h4>
                <p className="text-xs text-indigo-650/80 font-medium">Companies, job roles, dates, and bullet achievements</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "experience" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "experience" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "experience" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "experience" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-4">
                  {cvData.workExperience.map((work, idx) => (
                    <div 
                      id={`work-card-${work.id}`} 
                      key={work.id} 
                      className="p-5 bg-black text-white border border-slate-800 rounded-xl relative space-y-4 shadow-md transition-all duration-200"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <button
                        id={`delete-work-${work.id}`}
                        type="button"
                        onClick={() => removeWorkExperience(work.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Delete Work Experience block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-sans">
                        Job/Experience #{idx + 1}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                          <input
                            id={`input-company-${work.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Inbound Horizons Co."
                            value={work.company}
                            onChange={(e) => updateWorkExperience(work.id, "company", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title / Role</label>
                          <input
                            id={`input-position-${work.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="Growth Marketing Intern"
                            value={work.position}
                            onChange={(e) => updateWorkExperience(work.id, "position", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Location (City, ST)</label>
                          <input
                            id={`input-work-location-${work.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="San Francisco, CA"
                            value={work.location}
                            onChange={(e) => updateWorkExperience(work.id, "location", e.target.value)}
                          />
                        </div>
                        <div />

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                          <input
                            id={`input-work-start-${work.id}`}
                            type="month"
                            className="w-full px-3 py-2 text-sm text-white border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            style={{ backgroundColor: "#000000" }}
                            value={work.startDate}
                            onChange={(e) => updateWorkExperience(work.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {work.current ? "Present Date" : "End Date"}
                          </label>
                          <input
                            id={`input-work-end-${work.id}`}
                            type="month"
                            disabled={work.current}
                            className="w-full px-3 py-2 text-sm text-white border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition disabled:bg-neutral-955 disabled:opacity-40"
                            style={{ backgroundColor: "#000000" }}
                            value={work.endDate}
                            onChange={(e) => updateWorkExperience(work.id, "endDate", e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2 py-1">
                          <input
                            id={`input-work-current-${work.id}`}
                            type="checkbox"
                            className="rounded bg-neutral-900 border-neutral-800 text-emerald-500 focus:ring-emerald-500"
                            checked={work.current}
                            onChange={(e) => updateWorkExperience(work.id, "current", e.target.checked)}
                          />
                          <label htmlFor={`input-work-current-${work.id}`} className="text-xs text-slate-300 font-medium cursor-pointer select-none">
                            I currently work in this position
                          </label>
                        </div>
                      </div>

                      {/* Experience Bullets */}
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">Key achievements & roles:</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Pro Tip: Double tap Sparkle icons to polish descriptions with AI
                          </span>
                        </div>
                        <div className="space-y-2">
                          {work.bullets.map((bullet, bIdx) => {
                            const bulletKey = `w-${work.id}-${bIdx}`;
                            const isPolishing = polishingState[bulletKey];

                            return (
                              <div id={`bullet-row-${bulletKey}`} key={bIdx} className="flex gap-2 items-start">
                                <span className="text-xs text-slate-400 py-2">•</span>
                                <div className="relative flex-1">
                                  <textarea
                                    id={`input-bullet-${bulletKey}`}
                                    rows={2}
                                    className="w-full px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 pr-10"
                                    placeholder="Write a metric/result or action detail..."
                                    value={bullet}
                                    onChange={(e) => updateWorkBullet(work.id, bIdx, e.target.value)}
                                  />
                                  <button
                                    id={`action-polish-bullet-${bulletKey}`}
                                    type="button"
                                    disabled={isPolishing}
                                    onClick={() => polishBulletPoint(work.id, bIdx, false)}
                                    className={`absolute right-2 top-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-500 transition flex items-center justify-center ${
                                      isPolishing ? "animate-pulse" : ""
                                    }`}
                                    title="Polish with AI Sparkles"
                                  >
                                    {isPolishing ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                                <button
                                  id={`delete-bullet-${bulletKey}`}
                                  type="button"
                                  onClick={() => removeWorkBullet(work.id, bIdx)}
                                  className="text-slate-400 hover:text-red-400 p-2 transition self-start"
                                  title="Remove bullet line"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          id={`add-bullet-${work.id}`}
                          type="button"
                          onClick={() => addWorkBullet(work.id)}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-350 mt-2 transition"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Achievement Bullet
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    id="add-work-btn"
                    type="button"
                    onClick={addWorkExperience}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 w-full justify-center py-2.5 rounded-lg border border-dashed border-emerald-250 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Another Work Experience
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-experience-btn"
                      type="button"
                      onClick={() => toggleSection("experience")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. KEY PROJECTS */}
        <div id="section-projects" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-projects"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("projects")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-teal-50 text-teal-600 block">
                <Code className="w-4.5 h-4.5" />
              </span>
              <div className="text-left font-sans">
                <h4 className="text-sm font-extrabold text-indigo-950 tracking-tight">Key Projects</h4>
                <p className="text-xs text-indigo-650/80 font-medium">(Crucial for student CVs!) Academic/individual assignments & apps</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "projects" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "projects" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "projects" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "projects" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-4">
                  {cvData.projects.map((proj, idx) => (
                    <div 
                      id={`proj-card-${proj.id}`} 
                      key={proj.id} 
                      className="p-5 bg-black text-white border border-slate-800 rounded-xl relative space-y-4 shadow-md transition-all duration-200"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <button
                        id={`delete-proj-${proj.id}`}
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Delete Project Block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-xs font-bold text-teal-400 uppercase tracking-widest font-sans">
                        Project #{idx + 1}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                          <input
                            id={`input-proj-name-${proj.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="E.g. StudyHub Collaboration Tool"
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Your Role / Contribution</label>
                          <input
                            id={`input-proj-role-${proj.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="E.g. Lead Frontend Architect"
                            value={proj.role}
                            onChange={(e) => updateProject(proj.id, "role", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Project URL (GitHub / Live Link)</label>
                          <input
                            id={`input-proj-url-${proj.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="https://github.com/..."
                            value={proj.url}
                            onChange={(e) => updateProject(proj.id, "url", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Technologies Used (Commas separated)</label>
                          <input
                            id={`input-proj-tech-${proj.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="React, TypeScript, Tailwind, Node"
                            value={proj.technologies}
                            onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                          <input
                            id={`input-proj-start-${proj.id}`}
                            type="month"
                            className="w-full px-3 py-2 text-sm text-white border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            style={{ backgroundColor: "#000000" }}
                            value={proj.startDate}
                            onChange={(e) => updateProject(proj.id, "startDate", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                          <input
                            id={`input-proj-end-${proj.id}`}
                            type="month"
                            className="w-full px-3 py-2 text-sm text-white border border-neutral-800 rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            style={{ backgroundColor: "#000000" }}
                            value={proj.endDate}
                            onChange={(e) => updateProject(proj.id, "endDate", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Project Bullets */}
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">Key achievements/milestones:</span>
                        </div>
                        <div className="space-y-2">
                          {proj.bullets.map((bullet, bIdx) => {
                            const bulletKey = `p-${proj.id}-${bIdx}`;
                            const isPolishing = polishingState[bulletKey];

                            return (
                              <div id={`bullet-row-${bulletKey}`} key={bIdx} className="flex gap-2 items-start">
                                <span className="text-xs text-slate-400 py-2">•</span>
                                <div className="relative flex-1">
                                  <textarea
                                    id={`input-bullet-${bulletKey}`}
                                    rows={2}
                                    className="w-full px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-1 focus:ring-indigo-500 pr-10"
                                    placeholder="Explain how you built it, what metrics/benchmarks you cleared..."
                                    value={bullet}
                                    onChange={(e) => updateProjectBullet(proj.id, bIdx, e.target.value)}
                                  />
                                  <button
                                    id={`action-polish-bullet-${bulletKey}`}
                                    type="button"
                                    disabled={isPolishing}
                                    onClick={() => polishBulletPoint(proj.id, bIdx, true)}
                                    className={`absolute right-2 top-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-500 transition flex items-center justify-center ${
                                      isPolishing ? "animate-pulse" : ""
                                    }`}
                                    title="Polish with AI Sparkles"
                                  >
                                    {isPolishing ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                                <button
                                  id={`delete-bullet-${bulletKey}`}
                                  type="button"
                                  onClick={() => removeProjectBullet(proj.id, bIdx)}
                                  className="text-slate-400 hover:text-red-400 p-2 transition self-start"
                                  title="Remove bullet line"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          id={`add-bullet-${proj.id}`}
                          type="button"
                          onClick={() => addProjectBullet(proj.id)}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-teal-400 hover:text-teal-350 mt-1 transition"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Project Bullet Point
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    id="add-proj-btn"
                    type="button"
                    onClick={addProject}
                    className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50/50 hover:bg-teal-50 w-full justify-center py-2.5 rounded-lg border border-dashed border-teal-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Another Project Block
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-projects-btn"
                      type="button"
                      onClick={() => toggleSection("projects")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. SKILLS INVENTORY */}
        <div id="section-skills" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-skills"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("skills")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-pink-50 text-pink-600 block">
                <Code className="w-4.5 h-4.5" />
              </span>
              <div className="text-left font-sans">
                <h4 className="text-sm font-extrabold text-indigo-950 tracking-tight">Skills Inventory</h4>
                <p className="text-xs text-indigo-650/80 font-medium">Technical language tags, tools, frameworks & soft skills</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "skills" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "skills" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "skills" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "skills" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-4">
                  {cvData.skills.map((skCategory, idx) => (
                    <div 
                      id={`skill-card-${skCategory.id}`} 
                      key={skCategory.id} 
                      className="p-5 bg-black text-white border border-slate-800 rounded-xl relative space-y-4 shadow-md transition-all duration-200"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <button
                        id={`delete-skill-${skCategory.id}`}
                        type="button"
                        onClick={() => removeSkillCategory(skCategory.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Delete Skill Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Focus Category</label>
                          <input
                            id={`input-skill-cat-${skCategory.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition font-semibold"
                            placeholder="E.g., Back-End Languages"
                            value={skCategory.category}
                            onChange={(e) => updateSkillCategory(skCategory.id, "category", e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Skills list (Separated by commas)</label>
                          <input
                            id={`input-skill-list-${skCategory.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="React, Redux, Tailwind, Jest"
                            value={skCategory.skills}
                            onChange={(e) => updateSkillCategory(skCategory.id, "skills", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    id="add-skill-btn"
                    type="button"
                    onClick={addSkillCategory}
                    className="flex items-center gap-1.5 text-xs font-medium text-pink-650 hover:text-pink-700 bg-pink-50/50 hover:bg-pink-50 w-full justify-center py-2.5 rounded-lg border border-dashed border-pink-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Another Skills Category Block
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-skills-btn"
                      type="button"
                      onClick={() => toggleSection("skills")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 7. LANGUAGES & PROFICIENCY */}
        <div id="section-languages" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-languages"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("languages")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-cyan-50 text-cyan-600 block">
                <Globe className="w-4.5 h-4.5" />
              </span>
              <div className="text-left">
                <h4 className="text-sm font-semibold">Languages Known</h4>
                <p className="text-xs text-slate-400">Foreign languages spoken & general command standard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "languages" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "languages" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "languages" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "languages" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-3">
                  {cvData.languages.map((lang, idx) => (
                    <div 
                      id={`lang-card-${lang.id}`} 
                      key={lang.id} 
                      className="flex items-center gap-4 text-white border border-slate-800 rounded-xl relative shadow-md transition-all duration-200 p-5"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4 pr-8">
                        <div>
                          <input
                            id={`input-lang-name-${lang.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="E.g., English, French"
                            value={lang.name}
                            onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <select
                            id={`select-lang-proficiency-${lang.id}`}
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            value={lang.proficiency}
                            onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)}
                          >
                            <option value="Native" className="bg-neutral-900">Native Bilingual</option>
                            <option value="Fluent" className="bg-neutral-900">Fluent Speaker</option>
                            <option value="Professional" className="bg-neutral-900">Professional Competency</option>
                            <option value="Conversational" className="bg-neutral-900">Conversational Speaker</option>
                            <option value="Conversational / Basic" className="bg-neutral-900">Basic / Elementary</option>
                          </select>
                        </div>
                      </div>
                      <button
                        id={`delete-lang-${lang.id}`}
                        type="button"
                        onClick={() => removeLanguage(lang.id)}
                        className="absolute right-3 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Remove Language"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    id="add-lang-btn"
                    type="button"
                    onClick={addLanguage}
                    className="flex items-center gap-1.5 text-xs font-medium text-cyan-650 hover:text-cyan-700 bg-cyan-50/50 hover:bg-cyan-55 w-full justify-center py-2 rounded-lg border border-dashed border-cyan-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Introduce Language Tag
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-languages-btn"
                      type="button"
                      onClick={() => toggleSection("languages")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 8. CERTIFICATIONS / LICENSES */}
        <div id="section-certifications" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-certifications"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("certifications")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-amber-50 text-amber-600 block">
                <Award className="w-4.5 h-4.5" />
              </span>
              <div className="text-left">
                <h4 className="text-sm font-semibold">Certifications & Accreditations</h4>
                <p className="text-xs text-slate-400">Industry qualifications, bootcamps and digital badges</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "certifications" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "certifications" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "certifications" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "certifications" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-3">
                  {cvData.certifications.map((cert, idx) => (
                    <div 
                      id={`cert-card-${cert.id}`} 
                      key={cert.id} 
                      className="p-5 bg-black text-white border border-slate-800 rounded-xl relative shadow-md transition-all duration-200 grid grid-cols-1 md:grid-cols-3 gap-4 pr-8"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <div>
                        <input
                          id={`input-cert-name-${cert.id}`}
                          type="text"
                          className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                          placeholder="AWS Solutions Associate"
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          id={`input-cert-issuer-${cert.id}`}
                          type="text"
                          className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                          placeholder="Amazon Web Services"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          id={`input-cert-year-${cert.id}`}
                          type="text"
                          className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                          placeholder="E.g., 2025"
                          value={cert.year}
                          onChange={(e) => updateCertification(cert.id, "year", e.target.value)}
                        />
                      </div>
                      <button
                        id={`delete-cert-${cert.id}`}
                        type="button"
                        onClick={() => removeCertification(cert.id)}
                        className="absolute right-3 top-4 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Remove Certification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    id="add-cert-btn"
                    type="button"
                    onClick={addCertification}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-650 hover:text-amber-700 bg-amber-50/50 hover:bg-amber-50 w-full justify-center py-2 rounded-lg border border-dashed border-amber-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Another Award / Badge
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-certifications-btn"
                      type="button"
                      onClick={() => toggleSection("certifications")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 9. ACHIEVEMENTS & ACTIVITIES */}
        <div id="section-achievements" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          <button
            id="accordion-toggle-achievements"
            type="button"
            className="w-full flex items-center justify-between p-4 font-medium text-slate-800 hover:bg-slate-50 transition"
            onClick={() => toggleSection("achievements")}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-amber-50 text-amber-600 block">
                <Trophy className="w-4.5 h-4.5" />
              </span>
              <div className="text-left">
                <h4 className="text-sm font-semibold">Achievements, Activities & Volunteering</h4>
                <p className="text-xs text-slate-400">Hackathons, competitions, leadership and volunteering</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-md transition duration-150 ${
                activeTab === "achievements" 
                  ? "bg-emerald-50 text-emerald-700 font-bold" 
                  : "bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              }`}>
                {activeTab === "achievements" ? "Editing..." : "Edit Section"}
              </span>
              {activeTab === "achievements" ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {activeTab === "achievements" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 space-y-3">
                  {(cvData.achievements || []).map((ach) => (
                    <div 
                      id={`ach-card-${ach.id}`} 
                      key={ach.id} 
                      className="p-5 bg-black text-white border border-slate-800 rounded-xl relative space-y-4 shadow-md transition-all duration-200 grid grid-cols-1 gap-3 pr-8"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Award & Activity Title</label>
                          <input
                            id={`input-ach-title-${ach.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="E.g., Winner (1st Rank) - DevHacks"
                            value={ach.title}
                            onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Issuer</label>
                          <input
                            id={`input-ach-issuer-${ach.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="E.g., ACM Student Chapter"
                            value={ach.issuer}
                            onChange={(e) => updateAchievement(ach.id, "issuer", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Timing</label>
                          <input
                            id={`input-ach-year-${ach.id}`}
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                            placeholder="E.g., 2024 / Present"
                            value={ach.year}
                            onChange={(e) => updateAchievement(ach.id, "year", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description / Key Impact</label>
                        <textarea
                          id={`input-ach-desc-${ach.id}`}
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-400 transition"
                          placeholder="Briefly state features, leadership contributions, or volunteering impact..."
                          value={ach.description}
                          onChange={(e) => updateAchievement(ach.id, "description", e.target.value)}
                        />
                      </div>
                      <button
                        id={`delete-ach-${ach.id}`}
                        type="button"
                        onClick={() => removeAchievement(ach.id)}
                        className="absolute right-3 top-4 text-slate-400 hover:text-red-400 p-1 transition"
                        title="Remove Achievement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    id="add-ach-btn"
                    type="button"
                    onClick={addAchievement}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-650 hover:text-amber-700 bg-amber-50/50 hover:bg-amber-50 w-full justify-center py-2 rounded-lg border border-dashed border-amber-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Another Achievement / Activity
                  </button>

                  {/* Save Section Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/80">
                    <button
                      id="save-achievements-btn"
                      type="button"
                      onClick={() => toggleSection("achievements")}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4ff00] hover:bg-[#cbf400] text-black text-xs font-black uppercase tracking-wider transition-all rounded shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Section</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL / BOTTOM SHEET FOR AI SUMMARY ASSISTANT */}
      <AnimatePresence>
        {showAiSummaryModal && (
          <div id="ai-summary-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-base">Gemini Summary Copilot</h3>
                </div>
                <button
                  id="close-ai-summary-modal"
                  type="button"
                  onClick={() => {
                    setShowAiSummaryModal(false);
                    setAiSummaries(null);
                  }}
                  className="p-1 px-2.5 rounded text-sm text-slate-400 hover:bg-slate-150 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide Gemini a few bullet points, keywords, or focus pillars, and it will forge 3 highly custom summaries tailored for {cvData.resumeRoleType === "student" ? "student internships" : "senior job postings"}.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Target Industry / Keyword Focus</label>
                    <input
                      id="ai-summary-industry"
                      type="text"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      placeholder="E.g., Frontend Web Development / Marketing Growth / Financial Management"
                      value={summaryIndustry}
                      onChange={(e) => setSummaryIndustry(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Highlights, Achievements, or Motivators (optional)</label>
                    <textarea
                      id="ai-summary-keywords"
                      rows={3}
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      placeholder="E.g., CS Student with 3.9 GPA, built 2 web apps, specialized in responsive React layouts, eager to contribute."
                      value={summaryKeywords}
                      onChange={(e) => setSummaryKeywords(e.target.value)}
                    />
                  </div>
                </div>

                {summaryError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-start gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>{summaryError}</span>
                  </div>
                )}

                {!aiSummaries && (
                  <button
                    id="ai-generate-summary-submit"
                    type="button"
                    disabled={loadingSummary}
                    onClick={handleGenerateSummary}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                  >
                    {loadingSummary ? (
                      <>
                        <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                        Generating Premium Drafts...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4.5 h-4.5" />
                        Draft Options with Gemini
                      </>
                    )}
                  </button>
                )}

                {aiSummaries && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Choose a Professional Template Tone:
                    </h4>

                    {/* SUGGESTION 1 */}
                    <div className="p-3.5 bg-indigo-50/20 border border-indigo-100 rounded-xl hover:bg-indigo-50/50 transition relative group">
                      <h5 className="text-[10px] font-bold text-indigo-700 mb-1">Option 1: Classic & Core-Focused</h5>
                      <p className="text-xs text-slate-600 leading-relaxed pr-6">{aiSummaries.option1}</p>
                      <button
                        id="ai-select-summary-option1"
                        type="button"
                        onClick={() => selectSuggestedSummary(aiSummaries.option1)}
                        className="mt-2.5 font-semibold text-[10px] text-indigo-650 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Apply this summary <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* SUGGESTION 2 */}
                    <div className="p-3.5 bg-teal-50/25 border border-teal-100 rounded-xl hover:bg-teal-50/55 transition relative group">
                      <h5 className="text-[10px] font-bold text-teal-700 mb-1">Option 2: Specialized & Skills-Driven</h5>
                      <p className="text-xs text-slate-600 leading-relaxed pr-6">{aiSummaries.option2}</p>
                      <button
                        id="ai-select-summary-option2"
                        type="button"
                        onClick={() => selectSuggestedSummary(aiSummaries.option2)}
                        className="mt-2.5 font-semibold text-[10px] text-teal-650 hover:text-teal-800 flex items-center gap-1"
                      >
                        Apply this summary <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* SUGGESTION 3 */}
                    <div className="p-3.5 bg-amber-50/20 border border-amber-100 rounded-xl hover:bg-amber-50/50 transition relative group">
                      <h5 className="text-[10px] font-bold text-amber-700 mb-1">Option 3: Modern & Project-Led</h5>
                      <p className="text-xs text-slate-600 leading-relaxed pr-6">{aiSummaries.option3}</p>
                      <button
                        id="ai-select-summary-option3"
                        type="button"
                        onClick={() => selectSuggestedSummary(aiSummaries.option3)}
                        className="mt-2.5 font-semibold text-[10px] text-amber-650 hover:text-amber-800 flex items-center gap-1"
                      >
                        Apply this summary <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      id="ai-regenerate-summary-btn"
                      type="button"
                      onClick={handleGenerateSummary}
                      className="w-full text-center py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold transition"
                    >
                      🔄 Regenerate Different Variations
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom inner component to support arrow representation
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
export { ArrowRight };
