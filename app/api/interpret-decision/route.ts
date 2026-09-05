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

const SYSTEM_PROMPT = `Du bist ein professioneller Entscheidungsanalyse-Assistent für ein Nutzwertanalyse-Tool.
Deine Aufgabe: Interpretiere Benutzereingaben und erstelle strukturierte Analyserahmen.

Du bist ein GPT-4 Modell und sollst die volle Leistungsfähigkeit nutzen um:
1. Die Absicht des Benutzers präzise zu verstehen
2. Relevante Alternativen und Kriterien zu identifizieren
3. Einen professionellen Analyserahmen zu erstellen

WICHTIG: Die Eingabe muss NICHT in eine der 6 Standardkategorien passen. 
Analysiere den genauen Text des Benutzers und erstelle passende Alternativen und Kriterien dafür.

Richtlinien:
1. TITEL: Erstelle einen klaren, professionellen Entscheidungstitel auf Deutsch.
   - Wenn der Benutzer "X oder Y" fragt, nutze genau diese Begriffe
   - Halte es kurz aber aussagekräftig

2. BESCHREIBUNG: Verbessere die Formulierung zu einer professionellen Beschreibung.
   - Korrigiere Grammatik und Rechtschreibung
   - Behalte die ursprüngliche Bedeutung bei
   - Auf Deutsch schreiben

3. DOMAIN: Wähle die passendste Kategorie. Bei unklaren Eingaben wähle "other".

4. ALTERNATIVEN: Generiere 2-6 realistische Entscheidungsalternativen.
   - Wenn der Benutzer "A oder B" fragt, nutze A und B als Alternativen (kapitalisiert)
   - Füge ggf. eine "Status quo" Option hinzu
   - Alternativen sollten sich gegenseitig ausschliessen
   - WICHTIG: Erster Buchstabe jeder Alternative gross schreiben

5. KRITERIEN: Schlage 4-10 relevante Bewertungskriterien vor.
   - Kriterien sollten messbar oder vergleichbar sein
   - Mix aus wirtschaftlichen, qualitativen, strategischen und Risiko-Kriterien
   - Passend zum spezifischen Entscheidungskontext
   - Jedes Kriterium braucht einen klaren Namen und eine Beschreibung

6. EINSCHRÄNKUNGEN: Extrahiere erkannte Rahmenbedingungen (Budget, Zeit, etc.).

7. KONFIDENZ: Bewerte deine Interpretationssicherheit basierend auf der Klarheit der Eingabe.

Antworte IMMER auf Deutsch. Sei praktisch und realistisch. Nutze dein Wissen um branchenspezifische Kriterien vorzuschlagen.`;

// Additional security: sanitize and validate input
function sanitizeUserInput(input: unknown): string | null {
  if (typeof input !== "string") return null;
  
  return input
    .trim()
    // Remove potential script tags and HTML
    .replace(/<[^>]*>/g, "")
    // Remove control characters except newlines
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    // Limit length
    .slice(0, 1000);
}

/**
 * Einfache Ratenbegrenzung pro IP (Missbrauchs- und Kostenschutz).
 * In-Memory und damit pro Instanz – für ein verteiltes Deployment sollte sie
 * durch einen gemeinsamen Speicher (z. B. Redis) ersetzt werden.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(req: Request): boolean {
  const key = clientKey(req);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // Abgelaufene Einträge gelegentlich aufräumen, damit die Map nicht wächst.
    if (rateLimitBuckets.size > 5000) {
      for (const [entryKey, entry] of rateLimitBuckets) {
        if (entry.resetAt <= now) rateLimitBuckets.delete(entryKey);
      }
    }
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

// Validate package level
function validatePackageLevel(level: unknown): "basic" | "advanced" | "business" {
  if (level === "advanced") return "advanced";
  if (level === "business") return "business";
  return "basic";
}

export async function POST(req: Request) {
  try {
    if (isRateLimited(req)) {
      return Response.json(
        { error: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Parse request body with error handling
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { userInput, packageLevel } = body;
    const sanitizedInput = sanitizeUserInput(userInput);
    const validPackageLevel = validatePackageLevel(packageLevel);

    if (!sanitizedInput) {
      return Response.json(
        { error: "Missing or invalid user input" },
        { status: 400 }
      );
    }

    if (sanitizedInput.length < 3) {
      return Response.json(
        { error: "Input too short" },
        { status: 400 }
      );
    }

    // Adjust criteria count based on package level
    const maxCriteria = validPackageLevel === "basic" ? 6 : validPackageLevel === "advanced" ? 8 : 10;
    const maxAlternatives = validPackageLevel === "basic" ? 5 : 8;

    const { output } = await generateText({
      model: "openai/gpt-4o",
      output: Output.object({
        schema: decisionInterpretationSchema,
      }),
      system: SYSTEM_PROMPT,
      prompt: `Analysiere diese Benutzereingabe und erstelle einen strukturierten Entscheidungsrahmen.

WICHTIG: Extrahiere die KONKRETEN Alternativen aus dem Text des Benutzers!
- Wenn der Benutzer zwei Dinge vergleicht (z.B. "BMW vs Audi" oder "ob X besser ist als Y"), nutze GENAU diese Begriffe als Alternativen
- Erstelle NIEMALS generische Namen wie "Option A" oder "Option B"
- Behalte Markennamen, Modellbezeichnungen und spezifische Begriffe bei

Benutzereingabe: "${sanitizedInput}"

Package Level: ${validPackageLevel}
- Maximum ${maxAlternatives} Alternativen
- Maximum ${maxCriteria} Kriterien
- Alle Texte auf Deutsch
- Kriterien müssen spezifisch zum Thema passen`,
    });

    return Response.json({ interpretation: output });
  } catch (error) {
    // Nur serverseitig protokollieren – die Fehlermeldung kann interne
    // Konfigurationsdetails enthalten und gehört nicht in die Antwort.
    console.error("[interpret-decision] Error:", error);
    return Response.json(
      { error: "Die KI-Analyse ist derzeit nicht verfügbar." },
      { status: 502 }
    );
  }
}
