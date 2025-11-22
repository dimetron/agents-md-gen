import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, IdeType, AnalysisResponse } from "../types";

interface AiProvider {
  analyzeContext: (context: string) => Promise<AnalysisResponse>;
  generateRulesStream: (
    request: GenerationRequest,
    onChunk: (text: string) => void
  ) => Promise<void>;
}

const getSystemPrompt = (ide: IdeType): string => {
  const base = "You are an expert AI Tooling Specialist.";

  if (ide === IdeType.UNIVERSAL) {
    return `${base} You specialize in setting up a "Unified AI Context".
    You generate files that work together:
    - cursorrules: Micro-optimizations, formatting, and syntax strictness.
    - agents.md: "Advanced Cognitive Architecture" Configuration. detailed, XML-structured, and high-density prompts.
    - copilot-instructions.md: Chat personality and brevity settings.
    - codex-system.txt: Optimized system prompt for OpenAI Codex models.

    Ensure NO duplication of logic. Rules go in cursorrules. Strategy goes in agents.md.`;
  }

  if (ide === IdeType.CODEX) {
    return `${base} You specialize in creating high-performance System Prompts for OpenAI Codex models that define strict coding standards and behaviors.`;
  }

  return `${base} You generate specific configuration files.`;
};

class GeminiProvider implements AiProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model = "gemini-2.5-flash") {
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async analyzeContext(context: string): Promise<AnalysisResponse> {
    const prompt = `
    You are a Senior Architect analyzing a request to generate IDE context files.

    User Input Context: "${context}"

    Task:
    1. Analyze if the input provides enough technical detail (Framework, Language, Testing strategy, Folder structure).
    2. If the user pasted a package.json or file tree, that is usually sufficient -> Return "READY".
    3. If vague (e.g., "Make rules for a website"), return "NEEDS_INFO" and ask specifically about:
       - The testing framework (vital for Agents to run tests).
       - The state management or key libraries.
       - The preferred styling engine.

    Output JSON format:
    {
      "status": "READY" | "NEEDS_INFO",
      "summary": "Brief summary of detected stack (e.g., Next.js 14, Jest, Tailwind)",
      "questions": ["Question 1?", "Question 2?"] // Only if NEEDS_INFO
    }
  `;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) throw new Error("Failed to analyze context");
    return JSON.parse(response.text) as AnalysisResponse;
  }

  async generateRulesStream(
    request: GenerationRequest,
    onChunk: (text: string) => void
  ): Promise<void> {
    let prompt = `
    Generate configuration for: ${request.ide}
    Context/Stack: ${request.context}
  `;

    if (request.answers) {
      prompt += `\nUser Clarifications:\n${Object.entries(request.answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n")}`;
    }

    if (request.ide === IdeType.UNIVERSAL) {
      prompt += `
      \nPlease generate the following 4 files. Use the delimiters strictly.

      1. .cursorrules (For Cursor/VS Code)
         - Focus on: Syntax rules, naming conventions, strict file structure enforcement.
         - Include "Project triggers" (e.g., "When editing .tsx, ensure accessibility").

      2. agents.md (For Autonomous Agents / Windsurf / Cursor Agent)
         - STYLE: "Advanced Cognitive Architecture" Configuration.
         - DO NOT use simple bullet points. Use XML-style tagging for high informational density (e.g., <role>, <workflow>, <constraints>).
         - STRUCTURE:
           - <global_constraints>: NO hallucinations, strict TDD, "Chain of Thought" mandatory before code.
           - <mcp_tools>: Explicitly define usage of 'postgres-mcp', 'filesystem-mcp' etc. if relevant.
           - <roles>: Define the following with deep <profile>, <triggers>, and <interaction_protocol>:
             - @ProductOwner (Gherkin stories)
             - @Architect (Pattern enforcement, Folder structure)
             - @Developer (Implementation, TDD)
             - @QA (Test generation)
             - @Security (OWASP audits)
             - @Refactor (Context-aware cleanup)
             - @DevOps (CI/CD, Docker)
             - @TechWriter (Docs)
             - @Database (MCP Specialist)
         - MANDATORY: Enforce a <thinking_process> block before any code output to ensure quality.

      3. .github/copilot-instructions.md (For GitHub Copilot)
         - Focus on: Chat tone (terse/verbose), specific framework nuances not covered by linting.

      4. codex_system_prompt.txt (For OpenAI Codex / generic LLM Context)
         - A concise System Prompt summarizing the stack, coding style, and constraints for use with raw LLM calls.

      IMPORTANT: Separate each file with this exact delimiter line:
      --- START OF FILE: [filename] ---
    `;
    } else if (request.ide === IdeType.CODEX) {
      prompt += `
      \nGenerate a comprehensive System Prompt (codex_system_prompt.txt) for OpenAI Codex/GPT-4.
      The prompt should:
      - Define the Persona (Senior Engineer in [Stack]).
      - List strict Code Style rules.
      - specific "Do's and Don'ts".
      - Include examples of good vs bad code for this specific context.
    `;
    } else {
       prompt += `\nOutput only the raw file content for ${request.ide}. No markdown fences unless necessary.`;
    }

    try {
      const responseStream = await this.ai.models.generateContentStream({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: getSystemPrompt(request.ide),
          temperature: 0.2,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) onChunk(chunk.text);
      }
    } catch (error) {
      console.error("Error generating rules:", error);
      throw new Error("Failed to generate rules.");
    }
  }
}

class PlaceholderProvider implements AiProvider {
  constructor(private name: string, private instructions: string) {}

  async analyzeContext(): Promise<AnalysisResponse> {
    throw new Error(this.instructions);
  }

  async generateRulesStream(): Promise<void> {
    throw new Error(this.instructions);
  }
}

const buildPlaceholder = (name: string, envKeys: string[]) =>
  new PlaceholderProvider(
    name,
    `${name} provider not configured. Install the official SDK, set ${envKeys.join(", ")}, and implement the provider in services/aiService.ts.`
  );

let provider: AiProvider | null = null;

const getProvider = (): AiProvider => {
  if (provider) return provider;

  const providerName = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (providerName === "gemini") {
    provider = new GeminiProvider(process.env.GEMINI_API_KEY || process.env.API_KEY);
  } else if (providerName === "openai") {
    provider = buildPlaceholder("OpenAI", ["OPENAI_API_KEY"]);
  } else if (providerName === "claude") {
    provider = buildPlaceholder("Claude", ["CLAUDE_API_KEY"]);
  } else if (providerName === "azure-openai") {
    provider = buildPlaceholder("Azure OpenAI", ["AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_DEPLOYMENT"]);
  } else {
    provider = buildPlaceholder("Custom", ["AI_PROVIDER", "<provider-specific keys>"]);
  }

  return provider;
};

export const analyzeContext = async (context: string): Promise<AnalysisResponse> => {
  return getProvider().analyzeContext(context);
};

export const generateRulesStream = async (
  request: GenerationRequest,
  onChunk: (text: string) => void
): Promise<void> => {
  return getProvider().generateRulesStream(request, onChunk);
};
