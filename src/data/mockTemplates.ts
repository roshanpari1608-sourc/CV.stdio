import { CVData } from "../types";

export const DEFAULT_EMPTY_STATE: CVData = {
  resumeRoleType: "student",
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    website: "",
    linkedin: "",
    github: ""
  },
  summary: "",
  education: [],
  workExperience: [],
  projects: [],
  skills: [
    { id: "s1", category: "Technical Skills", skills: "" },
    { id: "s2", category: "Soft Skills", skills: "" }
  ],
  languages: [],
  certifications: [],
  achievements: []
};

export const STUDENT_MOCK_DATA: CVData = {
  resumeRoleType: "student",
  personalInfo: {
    firstName: "Rohan",
    lastName: "Pari",
    email: "roshanpari1608@gmail.com",
    phone: "+1 (555) 349-8812",
    location: "Boston, MA",
    headline: "Computer Science Undergraduate & Full-Stack Web Developer",
    website: "rohanpari.dev",
    linkedin: "linkedin.com/in/rohanpari",
    github: "github.com/rohanpari"
  },
  summary: "Enthusiastic and results-driven Computer Science Undergraduate specializing in Python, C, and responsive Web Development. Proven experience designing high-speed backend models and developing clean, interactive front-end web architectures. Active team player with clear communication skills, looking to channel modern software engineering patterns to solve core client challenges.",
  education: [
    {
      id: "edu-1",
      school: "Boston Science Institute",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science & Engineering",
      location: "Boston, MA",
      startDate: "2023-09",
      endDate: "2027-05",
      current: true,
      gpa: "9.12 / 10.00 CGPA",
      relevantCoursework: "Data Structures & Algorithms, Object-Oriented Systems, Web Architectures, Database Management",
      honors: "Dean's List (All semesters), Honors Academic Excellence Scholar"
    }
  ],
  workExperience: [
    {
      id: "work-1",
      company: "TechNexus Software Solutions",
      position: "Software Engineering Intern",
      location: "Boston, MA",
      startDate: "2024-05",
      endDate: "2024-08",
      current: false,
      bullets: [
        "Designed and implemented high-throughput security middleware for REST APIs, reducing unauthorized traffic by 18%.",
        "Developed dynamic data-visualization screens in React and TypeScript, boosting system load times by 25%.",
        "Collaborated with cross-functional software teams to integrate robust SQL schema validations, avoiding transaction errors."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "PyStream Dashboard",
      role: "Lead Systems Developer",
      technologies: "Python, Flask, PostgreSQL, React, Tailwind CSS",
      startDate: "2024-09",
      endDate: "2024-12",
      url: "github.com/rohanpari/pystream-dashboard",
      bullets: [
        "Developed custom Flask micro-servers in Python to process and ingest up to 12,000 real-time client analytics events per minute.",
        "Designed a highly interactive and responsive web dashboard UI featuring fluid graphs and fully custom dark theme panels."
      ]
    },
    {
      id: "proj-2",
      name: "C-Compiler Parse Tool",
      role: "Core Systems Engineer",
      technologies: "C, GCC, GDB, GNU Linux Assembly",
      startDate: "2024-01",
      endDate: "2024-04",
      url: "github.com/rohanpari/c-assembly-parser",
      bullets: [
        "Designed high-performance lexical scanner routines in pure C to increase parsing efficiency by 30%.",
        "Developed automated regression dry-run test structures to enforce safety margins and clean pointer resource allocations."
      ]
    }
  ],
  skills: [
    {
      id: "sk-1",
      category: "Technical Skills",
      skills: "Python, C, Web Development (JavaScript/TypeScript, HTML/CSS), SQL, Node.js, React, Tailwind CSS, Git"
    },
    {
      id: "sk-2",
      category: "Soft Skills",
      skills: "Effective Communication, Teamwork & Collaboration, Problem Solving, Analytical Thinking"
    }
  ],
  languages: [
    { id: "lang-1", name: "English", proficiency: "Native" },
    { id: "lang-2", name: "Spanish", proficiency: "Conversational" }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Professional React Web Developer Certificate",
      issuer: "Meta Academy",
      year: "2025"
    },
    {
      id: "cert-2",
      name: "Algorithms and Complex Systems in Python & C",
      issuer: "Silicon Valley Training Council",
      year: "2024"
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Winner (First Rank) - DevHacks Regional",
      issuer: "DevHacks Competition Guild",
      year: "2024",
      description: "Designed and pitched a smart-energy load balancer application against 50+ regional coder teams."
    },
    {
      id: "ach-2",
      title: "Student Chapter Vice President",
      issuer: "ACM Computer Science Association",
      year: "2025",
      description: "Coordinated campus hackathons and tech talks, boosting code event student registration by 45%."
    },
    {
      id: "ach-3",
      title: "Volunteering Web Development Mentor",
      issuer: "Coding For All Foundation",
      year: "2024",
      description: "Led free weekend bootcamps teaching Python basics to 35+ underprivileged middle school learners."
    }
  ]
};

export const PROFESSIONAL_MOCK_DATA: CVData = {
  resumeRoleType: "professional",
  personalInfo: {
    firstName: "Marcus",
    lastName: "Taylor",
    email: "marcus.taylor@careermail.com",
    phone: "+1 (555) 728-1192",
    location: "San Francisco, CA",
    headline: "Senior Growth Marketing Manager",
    website: "https://marcustaylor.co",
    linkedin: "linkedin.com/in/marcus-growth",
    github: ""
  },
  summary: "Results-driven Growth Marketing professional with over 6 years of industry experience spearheading multi-channel customer acquisition pipelines. Adept at turning performance analytics and user testing data into scalable digital campaigns. Championed client-focused experimentation strategies that boosted user conversion rates by 40% and reduced cost-per-acquisition by 22%.",
  education: [
    {
      id: "edu-prof-1",
      school: "San Francisco State University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Marketing & Communication",
      location: "San Francisco, CA",
      startDate: "2016-09",
      endDate: "2020-05",
      current: false,
      gpa: "3.71 / 4.00",
      relevantCoursework: "Digital Marketing Strategy, Consumer Behavior Analytics, Global Business Communications",
      honors: "Magna Cum Laude, President's Circle"
    }
  ],
  workExperience: [
    {
      id: "work-prof-1",
      company: "Apex Tech Solutions",
      position: "Senior Growth Marketing Specialist",
      location: "San Francisco, CA",
      startDate: "2022-06",
      endDate: "Present",
      current: true,
      bullets: [
        "Supervised a high-performing digital advertising team handling a $120k monthly optimization budget across LinkedIn, Google, and Meta.",
        "Spearheaded targeted SEO optimization hacks, boosting organic search conversions by 45% and elevating organic signups by 22k monthly.",
        "Reconstructed retention emails based on precise behavioral cohort analyses, driving user lifetime value (LTV) up by 18%."
      ]
    },
    {
      id: "work-prof-2",
      company: "Inbound Horizon",
      position: "Digital Campaign Manager",
      location: "Oakland, CA",
      startDate: "2020-07",
      endDate: "2022-05",
      current: false,
      bullets: [
        "Constructed and A/B tested 40+ customized post-click landing pages, climbing digital advertisement conversion rates from 2.4% to 4.1%.",
        "Configured robust end-to-end analytics attribution pipelines utilizing Google Tag Manager, delivering 100% advertising clarity."
      ]
    }
  ],
  projects: [],
  skills: [
    {
      id: "sk-prof-1",
      category: "Marketing Strategy",
      skills: "Growth Marketing, Search Engine Optimization (SEO), Paid Advertising (Meta/Google), Email Marketing Automation"
    },
    {
      id: "sk-prof-2",
      category: "Data & Tech",
      skills: "Google Analytics (GA4), SQL, Tableau, Salesforce, HubSpot, HTML/CSS"
    },
    {
      id: "sk-prof-3",
      category: "Core Competencies",
      skills: "LTV/CAC Optimization, Behavioral Cohort Analysis, Cross-functional Leadership, Technical Copywriting"
    }
  ],
  languages: [
    { id: "lang-prof-1", name: "English", proficiency: "Native" },
    { id: "lang-prof-2", name: "German", proficiency: "Fluent" }
  ],
  certifications: [
    {
      id: "cert-prof-1",
      name: "Google Analytics 4 Individual Qualification",
      issuer: "Google",
      year: "2024"
    },
    {
      id: "cert-prof-2",
      name: "HubSpot Inbound Marketing Certification",
      issuer: "HubSpot Academy",
      year: "2023"
    }
  ],
  achievements: [
    {
      id: "ach-prof-1",
      title: "Marketing Campaign of the Year Award",
      issuer: "Silicon Valley Growth Forum",
      year: "2023",
      description: "Recognized for driving 300% ROI on complex multi-tier lead generation workflows."
    }
  ]
};
