import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely and lazily to avoid crashing on startup if the API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Ensure error responses have a standard structure
const handleApiError = (res: express.Response, error: any, message: string) => {
  console.error(message, error);
  res.status(500).json({
    error: message,
    details: error instanceof Error ? error.message : String(error)
  });
};

// Endpoints for AI Resume Builder

// 1. Polish Bullet Point
app.post("/api/ai/polish-bullet", async (req, res) => {
  try {
    const { bullet, position, company, targetType } = req.body;
    if (!bullet) {
      return res.status(400).json({ error: "bullet content is required." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are an expert resume writer and recruiter. Your job is to rewrite raw resume bullet points to make them highly professional, impactful, and results-oriented.
Use strong action verbs, describe achievements, and whenever possible, frame them with outcomes/metrics.
Target Audience: ${targetType === "student" ? "Internships and entry-level recruiters (focusing on projects, core skills, enthusiasm, and achievements)" : "Professional recruiters (focusing on metrics, leadership, business value, and specific domain authority)"}.
For position "${position || "Candidate"}" at "${company || "Company"}", optimize the following bullet point. Keep it concise, single-sentence, and starting with a powerful action verb. Do not include quotes in the output.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: bullet,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const polishedText = response.text ? response.text.trim() : bullet;
    res.json({ polished: polishedText });
  } catch (err) {
    handleApiError(res, err, "Failed to polish bullet point with Gemini.");
  }
});

// 2. Suggest Professional Summary
app.post("/api/ai/suggest-summary", async (req, res) => {
  try {
    const { personalInfo, resumeRoleType, keyHighlights, industryFocus } = req.body;
    
    const ai = getGeminiClient();
    const studentInstruction = `You are an elite career coach. Draft 3 distinct options for a student profile summary / objective section on a CV.
The user is a student. Focus on their academic drive, self-motivation, core projects, fast learning abilities, and target career interests.
Each option should be exactly 2-3 sentences long, punchy, and professional. Match the tone:
- Option 1: Classic & Enthusiastic (Standard student objective)
- Option 2: Skills & Tech-focused (Highlights technical abilities and key domain knowledge)
- Option 3: Modern & Project-driven (Highlights achievements, projects, and active contributions)
Return as a structured JSON object.`;

    const professionalInstruction = `You are an executive CV writer. Draft 3 distinct options for a professional summary section on a resume.
The user is a working professional. Highlight years of experience, core industry domain knowledge, leadership/collaborative values, and quantifiable impacts.
Each option should be exactly 2-3 sentences long, punchy, and expert-level. Match the tone:
- Option 1: Executive & Impact-driven (Standard highlight of senior value and track record)
- Option 2: Specialized & Domain-focused (Highlights deep functional expertise and specialized toolkits)
- Option 3: Innovative & Strategy-oriented (Focuses on problem solving, modern methodologies, and leadership)
Return as a structured JSON object.`;

    const prompt = `Draft resume summaries based on these details:
Title/Headline: ${personalInfo?.headline || "Applicant"}
Industry Focus: ${industryFocus || "General Business / Tech"}
Key Highlights/Interests provided: "${keyHighlights || ""}"
Role Type: ${resumeRoleType || "professional"}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        option1: { type: Type.STRING, description: "Classic Resume Summary Option" },
        option2: { type: Type.STRING, description: "Technical/Skills Focused Option" },
        option3: { type: Type.STRING, description: "Modern/Innovative Option" },
      },
      required: ["option1", "option2", "option3"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: resumeRoleType === "student" ? studentInstruction : professionalInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8,
      },
    });

    const options = JSON.parse(response.text?.trim() || "{}");
    res.json(options);
  } catch (err) {
    handleApiError(res, err, "Failed to suggest summaries with Gemini.");
  }
});

// 3. Review Resume (Full CV Data Audit)
app.post("/api/ai/review-resume", async (req, res) => {
  try {
    const { cvData } = req.body;
    if (!cvData) {
      return res.status(400).json({ error: "Resume data is required." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are a critical Applicant Tracking System (ATS) auditor and expert recruiter.
Your goal is to thoroughly analyze the provided resume JSON payload and return a professional score and actionable feedback.
Provide:
1. An overall CV score (0 to 100) based on phrasing, structure completeness, formatting potential, and impact.
2. A lists of "Positives" (what is great, e.g. clean contact info, project highlights, etc.).
3. A lists of specific, constructive "Improvements" (where they can level-up, e.g., missing metrics, generic bullets, skill density).
4. A brief text explanation explaining the score.
5. A list of 5-8 highly relevant "Suggested Keywords" or skills they should incorporate to improve their ATS compatibility (customized for their Headline/Field).
Be critical but constructive. Ensure response matches the JSON schema exactly.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Score between 0 and 100" },
        positives: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Strengths of the current resume"
        },
        improvements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Clear actionable fixes to make the resume better"
        },
        scoreExplanation: { type: Type.STRING, description: "Brief executive explanation of the score" },
        suggestedKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Keywords to inject into skills or experience to pass ATS parsing"
        }
      },
      required: ["score", "positives", "improvements", "scoreExplanation", "suggestedKeywords"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Audit and review this resume payload:\n${JSON.stringify(cvData, null, 2)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      }
    });

    const auditResult = JSON.parse(response.text?.trim() || "{}");
    res.json(auditResult);
  } catch (err) {
    handleApiError(res, err, "Failed to analyze resume with Gemini.");
  }
});

// 4. Tailor Resume for specific Job Description
app.post("/api/ai/tailor-resume", async (req, res) => {
  try {
    const { cvData, jobDescription } = req.body;
    if (!cvData || !jobDescription) {
      return res.status(400).json({ error: "Both CV data and Job Description are required." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are a premium career consultant. Map the user's resume details to the provided target Job Description.
Identify key skill gaps, alignment opportunities, and suggest precise modifications.
Return a recommendations object containing:
1. Summary adaptation (suggested custom summary specifically tailored to this job).
2. Key focus checklist (prioritized things to highlight, e.g. "Highlight your React projects at the top", "Emphasize agile leadership").
3. Added skills (3-5 specific technical or core skills mentioned in the job post that the candidate should add, if they possess them).
Ensure response matches the JSON schema exactly.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        tailoredSummary: { type: Type.STRING, description: "Proposed customized summary for this job" },
        focusChecklist: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Priority recommendations for structural alignment"
        },
        matchingKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific terms/technologies from of the job description that should be integrated"
        }
      },
      required: ["tailoredSummary", "focusChecklist", "matchingKeywords"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Job Description:\n"""\n${jobDescription}\n"""\n\nCV Data:\n${JSON.stringify(cvData, null, 2)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.6,
      }
    });

    const tailoringReport = JSON.parse(response.text?.trim() || "{}");
    res.json(tailorReportResponse(tailoringReport));
  } catch (err) {
    handleApiError(res, err, "Failed to analyze target job tailoring with Gemini.");
  }
});

function tailorReportResponse(report: any) {
  return report;
}

// Vite integration middleware & static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
