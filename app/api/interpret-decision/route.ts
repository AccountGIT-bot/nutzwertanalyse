import { generateText, Output } from "ai";
import { z } from "zod";

// Schema for the structured decision interpretation
const decisionInterpretationSchema = z.object({
  // Improved decision title - clear and professional
  title: z.string().describe("A clear, professional title for the decision (max 80 characters)"),
  
  // Improved description - expanded and clarified version of user input
  description: z.string().describe("An improved, structured description of the decision problem (2-3 sentences)"),
  
  // Detected domain/context
  domain: z.enum([
    "supplier",
    "software", 
    "investment",
    "machines",
    "vehicle",
    "employee",
    "personal",
    "technology",
    "service",
    "other"
  ]).describe("The detected decision domain/context"),
  
  // Suggested alternatives
  alternatives: z.array(z.object({
    name: z.string().describe("Alternative name (concise)"),
    description: z.string().nullable().describe("Brief description of this alternative"),
  })).min(2).max(6).describe("Suggested decision alternatives"),
  
  // Suggested criteria
  criteria: z.array(z.object({
    name: z.string().describe("Criterion name"),
    description: z.string().describe("Brief description of what this criterion evaluates"),
    categoryId: z.enum(["economic", "quality", "strategic", "risk", "other"]).describe("Category of this criterion"),
  })).min(4).max(10).describe("Suggested evaluation criteria"),
  
  // Possible constraints or assumptions
  constraints: z.string().nullable().describe("Any constraints or assumptions detected in the input"),
  
  // Confidence level
  confidence: z.enum(["high", "medium", "low"]).describe("How confident the interpretation is"),
});

export type DecisionInterpretation = z.infer<typeof decisionInterpretationSchema>;

const SYSTEM_PROMPT = `You are a professional decision analysis assistant for a Nutzwertanalyse (utility analysis) tool. 
Your task is to interpret user decision descriptions and generate structured analysis frameworks.

Guidelines:
1. TITLE: Create a clear, professional decision title in German. Keep it concise but descriptive.

2. DESCRIPTION: Improve the user's wording into a professional, clear description. 
   - Fix grammar and spelling
   - Make it more formal and structured
   - Keep the original meaning intact
   - Write in German

3. DOMAIN: Detect the most appropriate decision domain from the options.

4. ALTERNATIVES: Generate 2-6 realistic decision alternatives.
   - Include at least one "status quo" or "do nothing" option when appropriate
   - Make alternatives mutually exclusive but collectively exhaustive
   - Use German names

5. CRITERIA: Suggest 4-10 relevant evaluation criteria.
   - Criteria should be measurable or at least comparable
   - Mix of economic, quality, strategic, and risk criteria
   - Appropriate for the specific decision context
   - Use German names and descriptions

6. CONSTRAINTS: Extract any constraints or assumptions mentioned or implied.

7. CONFIDENCE: Rate your interpretation confidence based on input clarity.

Always respond in German. Be practical and realistic in your suggestions.`;

export async function POST(req: Request) {
  try {
    const { userInput, packageLevel = "basic" } = await req.json();

    if (!userInput || typeof userInput !== "string") {
      return Response.json(
        { error: "Missing or invalid user input" },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedInput = userInput.trim().slice(0, 1000);

    if (sanitizedInput.length < 3) {
      return Response.json(
        { error: "Input too short" },
        { status: 400 }
      );
    }

    // Adjust criteria count based on package level
    const maxCriteria = packageLevel === "basic" ? 6 : packageLevel === "advanced" ? 8 : 10;
    const maxAlternatives = packageLevel === "basic" ? 5 : 8;

    const { output } = await generateText({
      model: "openai/gpt-4o-mini",
      output: Output.object({
        schema: decisionInterpretationSchema,
      }),
      system: SYSTEM_PROMPT,
      prompt: `Interpret the following decision and generate a structured analysis framework.

User Input: "${sanitizedInput}"

Package Level: ${packageLevel} (${packageLevel === "basic" ? "simpler, max 6 criteria" : packageLevel === "advanced" ? "detailed, max 8 criteria" : "comprehensive, max 10 criteria"})

Requirements:
- Maximum ${maxAlternatives} alternatives
- Maximum ${maxCriteria} criteria
- All text in German
- Practical and realistic suggestions`,
    });

    return Response.json({ interpretation: output });
  } catch (error) {
    console.error("[interpret-decision] Error:", error);
    return Response.json(
      { error: "Failed to interpret decision" },
      { status: 500 }
    );
  }
}
