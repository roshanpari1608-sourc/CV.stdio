export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  website: string;
  linkedin: string;
  github: string;
  photoUrl?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  relevantCoursework: string; // Comma separated list
  honors: string; // Comma separated list
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  technologies: string; // Comma-separated list for easy parsing/display
  startDate: string;
  endDate: string;
  url: string;
  bullets: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string; // Comma-separated list
}

export interface Language {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Conversational" | "Conversational / Basic";
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string; // Hackathon name, school event, or organization
  year: string;
  description: string;
}

export interface CVData {
  resumeRoleType: "student" | "professional";
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: SkillCategory[];
  languages: Language[];
  certifications: Certification[];
  achievements?: Achievement[];
}

export interface ResumeSettings {
  template: "classic" | "modern" | "creative";
  primaryColor: string; // hex
  fontFamily: "serif" | "sans" | "mono";
  spacing: "compact" | "normal" | "spacious";
  sectionsOrder: string[];
}

export interface AIReviewResult {
  score: number; // 0-100
  positives: string[];
  improvements: string[];
  scoreExplanation: string;
  suggestedKeywords: string[];
}
