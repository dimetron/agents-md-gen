<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

AgentRules.ai helps teams collaborate with role-based AI agents to plan features, design architecture, and generate implementation-ready rules and code scaffolding. Use the guide to learn the workflow, then switch to the generator to produce files tailored to your stack.

![Main app hero showing developer workspace background](https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000&auto=format&fit=crop)

## Usage

1. **Explore the guide** – The Guide tab explains each agent role (Product Owner, Architect, Developer, QA, Security, DevOps, and more) and shows how they collaborate. Use it to understand what prompts to provide and what outputs to expect.
2. **Provide project context** – In the Generator tab, paste a short description of your project or stack. You can start from a built-in template (e.g., Modern Web, Python Microservices, AWS Data Platform, Azure Streaming, or DevOps & Infra) to speed things up.
3. **Analyze and refine** – Click **Analyze Context**. The app inspects your input and may ask follow-up questions for missing details (database, frameworks, deployment, etc.). Answer directly in the app.
4. **Generate agent rules** – After questions are resolved, choose your IDE target and start generation. The streaming output includes structured agent instructions and parsed files organized into tabs for easy review.
5. **Review and copy outputs** – Switch between the generated files, copy content with the clipboard control, and paste into your IDE or repository. Use the References tab for quick reminders of available roles and commands.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Choose your AI provider (defaults to Gemini). Create `.env.local` and set one of the following:
   - Gemini (default):
     ```
     AI_PROVIDER=gemini
     GEMINI_API_KEY=your_key
     ```
   - OpenAI:
     ```
     AI_PROVIDER=openai
     OPENAI_API_KEY=your_key
     ```
   - Claude (Anthropic):
     ```
     AI_PROVIDER=claude
     CLAUDE_API_KEY=your_key
     ```
   - Azure OpenAI:
     ```
     AI_PROVIDER=azure-openai
     AZURE_OPENAI_API_KEY=your_key
     AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com
     AZURE_OPENAI_DEPLOYMENT=your_deployment_name
     ```

   The app ships with a Gemini implementation. Other providers use the same streaming interface; wire them up in `services/aiService.ts` by replacing the placeholder providers with SDK calls for your platform (OpenAI, Claude, Codex CLI, Azure OpenAI, or any custom LLM). Keep the method signatures intact to avoid breaking the UI.
3. Run the app:
   `npm run dev`
