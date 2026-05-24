import React from "react";
import { 
  Printer, Grid, Type, Sliders, Check, Mail, Phone, MapPin, 
  Linkedin, Github, Globe, ExternalLink, Award, Download, RefreshCw
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { CVData, ResumeSettings } from "../types";

interface ResumePreviewProps {
  cvData: CVData;
  settings: ResumeSettings;
  onUpdateSettings: (newSettings: ResumeSettings) => void;
}

const COLOR_PRESETS = [
  { name: "High Contrast Pitch", value: "#000000" },
  { name: "Slate Royal", value: "#1e3a8a" },
  { name: "Forest Emerald", value: "#065f46" },
  { name: "Midnight Plum", value: "#581c87" },
  { name: "Neon Kinetic", value: "#D4FF00" },
  { name: "Ruby Crimson", value: "#991b1b" }
];

const FONTS_PRESETS = [
  { name: "Classic Serif", value: "serif", cssClass: "font-serif" },
  { name: "Modern Sans", value: "sans", cssClass: "font-sans" },
  { name: "Editorial Mono", value: "mono", cssClass: "font-mono" }
];

const ensureUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const cleanDisplayUrl = (url: string) => {
  if (!url) return "";
  return url
    .replace(/(^\w+:|^)\/\//, "")
    .replace(/^www\./, "");
};

export default function ResumePreview({ cvData, settings, onUpdateSettings }: ResumePreviewProps) {
  const { template, primaryColor, fontFamily, spacing } = settings;
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("resume-printable-sheet");
    if (!element) return;

    try {
      setIsGeneratingPdf(true);

      const canvas = await html2canvas(element, {
        scale: 2.5, // Crisp resolution for text and layout details
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const firstName = cvData.personalInfo.firstName || "Resume";
      const lastName = cvData.personalInfo.lastName || "";
      const pdfName = `${firstName}${lastName ? "_" + lastName : ""}_Resume.pdf`;
      pdf.save(pdfName);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Spacing configurations
  const spacingClasses = {
    compact: {
      secSp: "space-y-2.5",
      elemSp: "space-y-1",
      mrg: "p-4 sm:p-6",
      textLg: "text-xs",
      textMd: "text-[11px]",
      textSm: "text-[10px]",
      titleGap: "mb-2 pb-1"
    },
    normal: {
      secSp: "space-y-4",
      elemSp: "space-y-2.5",
      mrg: "p-6 sm:p-10",
      textLg: "text-sm",
      textMd: "text-xs",
      textSm: "text-[11px]",
      titleGap: "mb-3.5 pb-1.5"
    },
    spacious: {
      secSp: "space-y-6",
      elemSp: "space-y-4",
      mrg: "p-8 sm:p-12",
      textLg: "text-base",
      textMd: "text-sm",
      textSm: "text-xs",
      titleGap: "mb-5 pb-20"
    }
  }[spacing];

  // Font selections
  const fontClass = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono"
  }[fontFamily];

  // Highlight styling
  const sectionTitleStyle = (borderBot = true) => ({
    color: primaryColor,
    borderBottomColor: borderBot ? `${primaryColor}22` : "transparent",
    borderBottomWidth: borderBot ? "1.5px" : "0px",
  });

  const bulletPointStyle = {
    borderColor: `${primaryColor}33`
  };

  // Helper: Format Date string e.g. "2024-09" -> "Sep 2024"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const [year, month] = dateStr.split("-");
      if (!month) return year;
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Shared Subsections so we don't duplicate code
  const renderSummarySection = () => (
    cvData.summary && (
      <div id="cv-preview-summary" className={spacingClasses.elemSp}>
        <h3 
          className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
          style={sectionTitleStyle(true)}
        >
          {cvData.resumeRoleType === "student" ? "Career Objective" : "Professional Summary"}
        </h3>
        <p className={`${spacingClasses.textMd} text-slate-650 leading-relaxed text-justify`}>
          {cvData.summary}
        </p>
      </div>
    )
  );

  const renderWorkExperience = () => (
    cvData.workExperience && cvData.workExperience.length > 0 && (
      <div id="cv-preview-work" className={spacingClasses.elemSp}>
        <h3 
          className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
          style={sectionTitleStyle(true)}
        >
          Work Experience
        </h3>
        <div className="space-y-3">
          {cvData.workExperience.map((work) => (
            <div key={work.id} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-xs">
                  {work.position}
                </span>
                <span className={`text-slate-500 font-medium ${spacingClasses.textSm}`}>
                  {formatDate(work.startDate)} – {work.current ? "Present" : formatDate(work.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-slate-600 font-semibold text-[11px]">
                <span>{work.company}</span>
                <span className="italic">{work.location}</span>
              </div>
              <ul className="list-disc list-outside pl-4 space-y-0.5 mt-1 text-slate-600">
                {work.bullets.map((bullet, idx) => (
                  <li key={idx} className={`${spacingClasses.textSm} leading-relaxed`}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const renderProjects = () => (
    cvData.projects && cvData.projects.length > 0 && (
      <div id="cv-preview-projects" className={spacingClasses.elemSp}>
        <h3 
          className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
          style={sectionTitleStyle(true)}
        >
          Projects
        </h3>
        <div className="space-y-3">
          {cvData.projects.map((proj) => (
            <div key={proj.id} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800 text-xs">
                    {proj.name}
                  </span>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-[9px] hover:underline flex items-center gap-0.5 font-medium" style={{ color: primaryColor }}>
                      <Globe className="w-2.5 h-2.5" /> Site <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                </div>
                <span className={`text-slate-500 font-medium ${spacingClasses.textSm}`}>
                  {formatDate(proj.startDate)} – {formatDate(proj.endDate)}
                </span>
              </div>
              <p className={`text-[11px] font-semibold text-slate-600`}>
                Role: {proj.role} {proj.technologies && <span className="font-normal text-slate-500">({proj.technologies})</span>}
              </p>
              <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-600">
                {proj.bullets.map((bullet, idx) => (
                  <li key={idx} className={`${spacingClasses.textSm} leading-relaxed`}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const renderEducation = () => (
    cvData.education && cvData.education.length > 0 && (
      <div id="cv-preview-education" className={spacingClasses.elemSp}>
        <h3 
          className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
          style={sectionTitleStyle(true)}
        >
          Education History
        </h3>
        <div className="space-y-3">
          {cvData.education.map((edu) => (
            <div key={edu.id} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-xs">
                  {edu.school}
                </span>
                <span className={`text-slate-505 font-medium ${spacingClasses.textSm}`}>
                  {formatDate(edu.startDate)} – {edu.current ? "Present" : formatDate(edu.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-slate-600 font-semibold text-[11px]">
                <span>{edu.degree} in {edu.fieldOfStudy}</span>
                <span className="italic">{edu.location}</span>
              </div>
              
              {edu.gpa && (
                <p className={`${spacingClasses.textSm} text-slate-600 font-medium`}>
                  Grade / GPA: <span className="font-bold text-slate-850">{edu.gpa}</span>
                </p>
              )}
              {edu.relevantCoursework && (
                <p className={`${spacingClasses.textSm} text-slate-500 leading-relaxed`}>
                  <strong className="text-slate-600 font-semibold">Coursework:</strong> {edu.relevantCoursework}
                </p>
              )}
              {edu.honors && (
                <p className={`${spacingClasses.textSm} text-slate-500 leading-relaxed`}>
                  <strong className="text-slate-600 font-semibold">Honors & Activities:</strong> {edu.honors}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  );

  const renderSkills = () => (
    cvData.skills && cvData.skills.length > 0 && cvData.skills.some(cat => cat.skills.trim()) && (
      <div id="cv-preview-skills" className={spacingClasses.elemSp}>
        <h3 
          className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
          style={sectionTitleStyle(true)}
        >
          {cvData.resumeRoleType === "student" ? "Skills Profile" : "Skills Inventory"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {cvData.skills.map((cat) => (
            cat.skills.trim() && (
              <div key={cat.id} className="text-xs">
                <strong className="text-slate-700 block mb-0.5">{cat.category}</strong>
                <span className="text-slate-600 leading-relaxed block">{cat.skills}</span>
              </div>
            )
          ))}
        </div>
      </div>
    )
  );

  const renderLanguagesAndCerts = () => {
    const hasLanguages = cvData.languages && cvData.languages.length > 0;
    const hasCerts = cvData.certifications && cvData.certifications.length > 0;

    if (!hasLanguages && !hasCerts) return null;

    return (
      <div id="cv-preview-extras" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Languages section */}
        {hasLanguages && (
          <div className={spacingClasses.elemSp}>
            <h3 
              className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
              style={sectionTitleStyle(true)}
            >
              Languages Speak
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {cvData.languages.map((lang) => (
                <div key={lang.id} className="text-xs">
                  <span className="font-semibold text-slate-800 block">{lang.name}</span>
                  <span className="text-[10px] text-slate-500 block">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications section */}
        {hasCerts && (
          <div className={spacingClasses.elemSp}>
            <h3 
              className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
              style={sectionTitleStyle(true)}
            >
              Certifications & Badges
            </h3>
            <div className="space-y-1.5">
              {cvData.certifications.map((cert) => (
                <div key={cert.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-semibold text-slate-800">
                    <span className="truncate max-w-[80%]">{cert.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{cert.year}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">{cert.issuer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAchievements = () => {
    const hasAchievements = cvData.achievements && cvData.achievements.length > 0;
    if (!hasAchievements) return null;

    if (template === "classic") {
      return (
        <div id="cv-preview-achievements" className={spacingClasses.elemSp}>
          <h3 
            className={`text-xs font-bold uppercase tracking-wider ${spacingClasses.titleGap}`}
            style={sectionTitleStyle(true)}
          >
            Achievements & Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cvData.achievements?.map((ach) => (
              <div key={ach.id} className="text-xs space-y-0.5">
                <div className="flex justify-between items-baseline font-semibold text-slate-800">
                  <span className="font-semibold text-slate-850 truncate max-w-[80%]">{ach.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{ach.year}</span>
                </div>
                {ach.issuer && <span className="text-[10px] text-indigo-600 block font-medium">{ach.issuer}</span>}
                {ach.description && <p className="text-[10px] text-slate-500 leading-normal">{ach.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (template === "creative") {
      return (
        <div id="cv-preview-achievements" className={spacingClasses.elemSp}>
          <h3 className="text-xs font-black uppercase tracking-wider pl-2" style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}` }}>
            Achievements, Leadership & Activities
          </h3>
          <div className="pl-5 border-l border-slate-100 space-y-3 ml-1.5 mt-2">
            {cvData.achievements?.map((ach) => (
              <div key={ach.id} className="relative space-y-0.5">
                <span className="absolute -left-[24px] top-1.5 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: primaryColor }} />
                <div className="flex justify-between items-baseline font-bold text-slate-800 text-xs">
                  <span>{ach.title}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{ach.year}</span>
                </div>
                {ach.issuer && <p className="text-[10px] font-semibold text-slate-650">{ach.issuer}</p>}
                {ach.description && <p className="text-[10px] text-slate-500 leading-normal">{ach.description}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Modern template rendering
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Achievements & Activities</h4>
        <div className="space-y-2.5">
          {cvData.achievements?.map((ach) => (
            <div key={ach.id} className="text-[11px] space-y-0.5">
              <span className="font-semibold text-slate-700 block leading-tight">{ach.title}</span>
              <span className="text-[9px] text-slate-450 block">{ach.issuer} ({ach.year})</span>
              {ach.description && <p className="text-[9.5px] text-slate-500 leading-snug">{ach.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Complete name block
  const nameHeader = () => {
    const hasContact = 
      cvData.personalInfo.email || 
      cvData.personalInfo.phone || 
      cvData.personalInfo.location ||
      cvData.personalInfo.website ||
      cvData.personalInfo.linkedin ||
      cvData.personalInfo.github;

    return (
      <div id="cv-header-block" className="space-y-3 border-b-2 pb-4 text-center flex flex-col items-center justify-center" style={{ borderBottomColor: `${primaryColor}22` }}>
        {cvData.personalInfo.photoUrl && (
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 shadow-xs mb-1 bg-slate-50" style={{ borderColor: primaryColor }}>
            <img 
              src={cvData.personalInfo.photoUrl} 
              alt={`${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="space-y-1 w-full text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-905 uppercase" style={{ color: primaryColor }}>
            {cvData.personalInfo.firstName || "YOUR"} {cvData.personalInfo.lastName || "NAME"}
          </h1>
          {cvData.personalInfo.headline && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {cvData.personalInfo.headline}
            </p>
          )}
        </div>
        
        {hasContact && (
          <div className="flex flex-wrap justify-center items-center gap-y-1.5 gap-x-4 text-[10px] text-slate-500 font-medium">
            {cvData.personalInfo.email && (
              <a href={`mailto:${cvData.personalInfo.email}`} className="flex items-center gap-1 hover:underline">
                <Mail className="w-3 h-3 block shrink-0" style={{ color: primaryColor }} /> {cvData.personalInfo.email}
              </a>
            )}
            {cvData.personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 block shrink-0" style={{ color: primaryColor }} /> {cvData.personalInfo.phone}
              </span>
            )}
            {cvData.personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 block shrink-0" style={{ color: primaryColor }} /> {cvData.personalInfo.location}
              </span>
            )}
            {cvData.personalInfo.website && (
              <a href={ensureUrl(cvData.personalInfo.website)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                <Globe className="w-3 h-3 block shrink-0" style={{ color: primaryColor }} /> {cleanDisplayUrl(cvData.personalInfo.website)}
              </a>
            )}
            {cvData.personalInfo.linkedin && (
              <a href={ensureUrl(cvData.personalInfo.linkedin)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                <Linkedin className="w-3 h-3 block shrink-0" style={{ color: primaryColor }} /> {cleanDisplayUrl(cvData.personalInfo.linkedin)}
              </a>
            )}
            {cvData.personalInfo.github && (
              <a href={ensureUrl(cvData.personalInfo.github)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                <Github className="w-3 h-3 block shrink-0" style={{ color: primaryColor }} /> {cleanDisplayUrl(cvData.personalInfo.github)}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Editor & Setting Controls Panel */}
      <div id="preview-settings-toolbar" className="bg-[#121212] rounded-none p-5 border border-white/10 shadow-none space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#D4FF00] tracking-tighter">02</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live PDF Preview & Page Layout</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="download-pdf-instant-btn"
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 font-black rounded-none text-xs uppercase tracking-widest transition-all duration-155 border border-transparent shadow-none ${
                isGeneratingPdf 
                  ? "bg-white/10 text-white/40 cursor-not-allowed" 
                  : "bg-[#D4FF00] hover:bg-[#c2eb00] text-black cursor-pointer"
              }`}
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </>
              )}
            </button>
            <button
              id="print-download-pdf-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-[#D4FF00] text-black font-black rounded-none text-xs uppercase tracking-widest transition-all duration-155 border border-transparent shadow-none cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save
            </button>
          </div>
        </div>

        {/* Setting selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Template Select */}
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 font-mono">Template Style</label>
            <select
              id="select-setting-template"
              className="w-full p-2.5 border border-white/10 rounded-none bg-[#0A0A0A] text-white text-xs uppercase font-bold tracking-wider outline-none focus:border-[#D4FF00]"
              value={template}
              onChange={(e: any) => onUpdateSettings({ ...settings, template: e.target.value })}
            >
              <option value="classic">Classic Executive</option>
              <option value="modern">Modern Professional</option>
              <option value="creative">Creative Horizon</option>
            </select>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 font-mono">Color Accents</label>
            <div className="relative">
              <select
                id="select-setting-color"
                className="w-full p-2.5 border border-white/10 rounded-none bg-[#0A0A0A] text-white text-xs uppercase font-bold tracking-wider outline-none focus:border-[#D4FF00]"
                value={primaryColor}
                onChange={(e) => onUpdateSettings({ ...settings, primaryColor: e.target.value })}
              >
                {COLOR_PRESETS.map((col) => (
                  <option key={col.value} value={col.value}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fonts preset */}
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 font-mono">Typography Family</label>
            <select
              id="select-setting-font"
              className="w-full p-2.5 border border-white/10 rounded-none bg-[#0A0A0A] text-white text-xs uppercase font-bold tracking-wider outline-none focus:border-[#D4FF00]"
              value={fontFamily}
              onChange={(e: any) => onUpdateSettings({ ...settings, fontFamily: e.target.value })}
            >
              {FONTS_PRESETS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Line & Margin Densities */}
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 font-mono">Spacing Density</label>
            <select
              id="select-setting-spacing"
              className="w-full p-2.5 border border-white/10 rounded-none bg-[#0A0A0A] text-white text-xs uppercase font-bold tracking-wider outline-none focus:border-[#D4FF00]"
              value={spacing}
              onChange={(e: any) => onUpdateSettings({ ...settings, spacing: e.target.value })}
            >
              <option value="compact">Compact / Dense</option>
              <option value="normal">Standard Layout</option>
              <option value="spacious">Spacious / Breathable</option>
            </select>
          </div>
        </div>

        <p className="text-[10px] text-white/50 leading-normal bg-white/5 p-3 border border-white/10 rounded-none uppercase font-mono tracking-wider">
          💡 <strong className="text-[#D4FF00]">Export Rule:</strong> When printing using the native browser dialog, check the option <strong className="text-[#D4FF00]">"Background Graphics"</strong> and turn off <strong className="text-[#D4FF00]">"Headers and Footers"</strong> for a pristine single-sheet output.
        </p>
      </div>

      {/* Responsive swipe helper for mobile viewports */}
      <div className="flex md:hidden items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 border border-white/10 text-white/70 text-[10px] uppercase font-mono tracking-widest leading-none mb-1 shadow-inner rounded-none select-none">
        <span>↔️ Swipe horizontally to inspect precise A4 layout printable dimensions</span>
      </div>

      {/* Horizontal scrolling wrapper frame to protect true layout proportions on small viewports */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent rounded-none">
        {/* Actual A4 Sheet Layout Container */}
        <div 
          id="capture-pdf-target" 
          className="relative group/sheet p-3 sm:p-6 bg-[#161616] border border-white/10 rounded-none print:p-0 print:bg-transparent print:border-none print:shadow-none min-w-[690px] md:min-w-0"
        >
          <div 
            id="resume-printable-sheet"
            className={`bg-white text-black rounded-none shadow-[0_45px_100px_-20px_rgba(0,0,0,0.65)] select-text transition-all duration-300 w-full mx-auto md:max-w-[760px] min-h-[1050px] sheet-layout relative ${fontClass} ${spacingClasses.mrg}`}
            style={{ letterSpacing: "-0.015em" }}
          >
          {/* Aesthetic left side anchor accent bar matching the master design */}
          <div className="absolute top-0 left-0 w-2.5 h-full print:hidden" style={{ backgroundColor: primaryColor || "#000000" }}></div>
          {/* OPTION 1: CLASSIC TEMPLATE */}
          {template === "classic" && (
            <div className={spacingClasses.secSp}>
              {nameHeader()}
              {renderSummarySection()}
              {renderEducation()}
              {renderWorkExperience()}
              {renderProjects()}
              {renderSkills()}
              {renderAchievements()}
              {renderLanguagesAndCerts()}
            </div>
          )}

          {/* OPTION 2: MODERN TWO-COLUMN MODULE TEMPLATE */}
          {template === "modern" && (
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${spacingClasses.secSp}`}>
              
              {/* Main Column */}
              <div className="md:col-span-2 space-y-6">
                <div id="modern-name-header" className="flex items-center gap-4 border-b pb-4" style={{ borderColor: `${primaryColor}15` }}>
                  {cvData.personalInfo.photoUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 shadow-xs bg-slate-50" style={{ borderColor: primaryColor }}>
                      <img 
                        src={cvData.personalInfo.photoUrl} 
                        alt={`${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="space-y-1 w-full">
                    <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
                      {cvData.personalInfo.firstName || "YOUR"} {cvData.personalInfo.lastName || "NAME"}
                    </h1>
                    {cvData.personalInfo.headline && (
                      <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">{cvData.personalInfo.headline}</p>
                    )}
                  </div>
                </div>
                {renderSummarySection()}
                {renderWorkExperience()}
                {renderProjects()}
              </div>

              {/* Sidebar Column */}
              <div className="md:col-span-1 space-y-6 md:border-l pl-0 md:pl-6 pt-6 md:pt-0" style={{ borderColor: `${primaryColor}15` }}>
                {/* Contact sidebar list */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Get In Touch</h4>
                  <div className="space-y-2 text-[10px] text-slate-500 font-medium">
                    {cvData.personalInfo.email && (
                      <div className="flex items-start gap-1.5">
                        <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                        <a href={`mailto:${cvData.personalInfo.email}`} className="break-all hover:underline text-slate-700">
                          {cvData.personalInfo.email}
                        </a>
                      </div>
                    )}
                    {cvData.personalInfo.phone && (
                      <div className="flex items-start gap-1.5">
                        <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                        <span>{cvData.personalInfo.phone}</span>
                      </div>
                    )}
                    {cvData.personalInfo.location && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                        <span>{cvData.personalInfo.location}</span>
                      </div>
                    )}
                    {cvData.personalInfo.website && (
                      <div className="flex items-start gap-1.5 break-all">
                        <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                        <a href={ensureUrl(cvData.personalInfo.website)} target="_blank" rel="noreferrer" className="hover:underline text-slate-700">
                          {cleanDisplayUrl(cvData.personalInfo.website)}
                        </a>
                      </div>
                    )}
                    {cvData.personalInfo.linkedin && (
                      <div className="flex items-start gap-1.5 break-all">
                        <Linkedin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                        <a href={ensureUrl(cvData.personalInfo.linkedin)} target="_blank" rel="noreferrer" className="hover:underline text-slate-700">
                          {cleanDisplayUrl(cvData.personalInfo.linkedin)}
                        </a>
                      </div>
                    )}
                    {cvData.personalInfo.github && (
                      <div className="flex items-start gap-1.5 break-all">
                        <Github className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                        <a href={ensureUrl(cvData.personalInfo.github)} target="_blank" rel="noreferrer" className="hover:underline text-slate-700">
                          {cleanDisplayUrl(cvData.personalInfo.github)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {renderEducation()}

                {/* Vertical Skills layout */}
                {cvData.skills && cvData.skills.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Skills Inventory</h4>
                    <div className="space-y-2">
                      {cvData.skills.map((cat) => (
                        cat.skills.trim() && (
                          <div key={cat.id} className="text-[11px]">
                            <strong className="text-slate-700 block font-semibold">{cat.category}</strong>
                            <span className="text-slate-500 block leading-normal">{cat.skills}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Extras layout */}
                {cvData.languages && cvData.languages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Languages</h4>
                    <div className="space-y-1">
                      {cvData.languages.map((lang) => (
                        <div key={lang.id} className="text-[11px] flex justify-between">
                          <span className="font-semibold text-slate-700">{lang.name}</span>
                          <span className="text-slate-400 text-[10px]">{lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cvData.certifications && cvData.certifications.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Certifications</h4>
                    <div className="space-y-2">
                      {cvData.certifications.map((cert) => (
                        <div key={cert.id} className="text-[11px]">
                          <span className="font-semibold text-slate-700 block leading-tight">{cert.name}</span>
                          <span className="text-[10px] text-slate-450 block">{cert.issuer} ({cert.year})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {renderAchievements()}
              </div>
            </div>
          )}

          {/* OPTION 3: CREATIVE HORIZON TIMELINE TEMPLATE */}
          {template === "creative" && (
            <div className={spacingClasses.secSp}>
              {/* Artistic creative header */}
              <div 
                id="creative-header-banner" 
                className="p-5 border-l-4 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative overflow-hidden" 
                style={{ borderLeftColor: primaryColor }}
              >
                {cvData.personalInfo.photoUrl && (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 p-0.5 shrink-0 shadow-xs bg-slate-50" style={{ borderColor: primaryColor }}>
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      <img 
                        src={cvData.personalInfo.photoUrl} 
                        alt={`${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5 flex-1 w-full">
                  <div className="absolute right-2 top-2 print:hidden sm:block hidden">
                    <Award className="w-10 h-10 stroke-[0.5]" style={{ color: `${primaryColor}22` }} />
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tight leading-tight" style={{ color: primaryColor }}>
                    {cvData.personalInfo.firstName || "YOUR"} {cvData.personalInfo.lastName || "NAME"}
                  </h1>
                  {cvData.personalInfo.headline && (
                    <p className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                      {cvData.personalInfo.headline}
                    </p>
                  )}
                
                {/* Clean responsive contact info block */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1.5 font-medium">
                  {cvData.personalInfo.email && <span>📧 {cvData.personalInfo.email}</span>}
                  {cvData.personalInfo.phone && <span>📞 {cvData.personalInfo.phone}</span>}
                  {cvData.personalInfo.location && <span>📍 {cvData.personalInfo.location}</span>}
                  {cvData.personalInfo.website && (
                    <a href={ensureUrl(cvData.personalInfo.website)} target="_blank" rel="noreferrer" className="underline hover:opacity-85 text-slate-700">
                      🌐 {cleanDisplayUrl(cvData.personalInfo.website)}
                    </a>
                  )}
                  {cvData.personalInfo.linkedin && (
                    <a href={ensureUrl(cvData.personalInfo.linkedin)} target="_blank" rel="noreferrer" className="underline hover:opacity-85 text-slate-700">
                      🔗 {cleanDisplayUrl(cvData.personalInfo.linkedin)}
                    </a>
                  )}
                  {cvData.personalInfo.github && (
                    <a href={ensureUrl(cvData.personalInfo.github)} target="_blank" rel="noreferrer" className="underline hover:opacity-85 text-slate-700">
                      🐙 {cleanDisplayUrl(cvData.personalInfo.github)}
                    </a>
                  )}
                </div>
              </div>
            </div>

              {renderSummarySection()}
              
              {/* Creative stagger education timeline */}
              {cvData.education && cvData.education.length > 0 && (
                <div id="creative-edu-section" className={spacingClasses.elemSp}>
                  <h3 className="text-xs font-black uppercase tracking-wider pl-2" style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}` }}>
                    Academic Foundation
                  </h3>
                  <div className="pl-5 border-l border-slate-100 space-y-4 ml-1.5">
                    {cvData.education.map((edu) => (
                      <div key={edu.id} className="relative space-y-1">
                        <span className="absolute -left-[24px] top-1.5 w-2 h-2 rounded-full border" style={{ backgroundColor: primaryColor, borderColor: primaryColor }} />
                        <div className="flex justify-between items-baseline font-bold text-slate-800 text-xs">
                          <span>{edu.school}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{formatDate(edu.startDate)} – {edu.current ? "Present" : formatDate(edu.endDate)}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600">{edu.degree} inside {edu.fieldOfStudy} ({edu.location})</p>
                        {edu.gpa && <p className="text-[10px] text-indigo-600 font-semibold">Rank score: {edu.gpa}</p>}
                        {edu.relevantCoursework && <p className="text-[10px] text-slate-450 leading-relaxed"><strong className="text-slate-600 font-medium">Core courses:</strong> {edu.relevantCoursework}</p>}
                        {edu.honors && <p className="text-[10px] text-slate-450 leading-relaxed"><strong className="text-slate-600 font-medium">Extra engagements:</strong> {edu.honors}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work history */}
              {cvData.workExperience && cvData.workExperience.length > 0 && (
                <div id="creative-work-section" className={spacingClasses.elemSp}>
                  <h3 className="text-xs font-black uppercase tracking-wider pl-2" style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}` }}>
                    Real World Experience
                  </h3>
                  <div className="pl-5 border-l border-slate-100 space-y-4 ml-1.5">
                    {cvData.workExperience.map((work) => (
                      <div key={work.id} className="relative space-y-1">
                        <span className="absolute -left-[24px] top-1.5 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: primaryColor }} />
                        <div className="flex justify-between items-baseline font-bold text-slate-800 text-xs">
                          <span>{work.position}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{formatDate(work.startDate)} – {work.current ? "Present" : formatDate(work.endDate)}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-650">{work.company} ({work.location})</p>
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-605">
                          {work.bullets.map((bullet, idx) => (
                            <li key={idx} className={`${spacingClasses.textSm} leading-relaxed`}>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderProjects()}
              {renderSkills()}
              {renderAchievements()}
              {renderLanguagesAndCerts()}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
export { COLOR_PRESETS, FONTS_PRESETS };
