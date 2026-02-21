/**
 * aiInsights.js
 * ─────────────────────────────────────────────────────────────────
 * TECHNOLOGY: Anthropic Claude API + prompt engineering.
 *
 * This module takes the user's real logged data, formats it into
 * a structured prompt, sends it to Claude, and returns personalized
 * health insights.
 *
 * KEY CONCEPT — Prompt Engineering:
 * The quality of AI output depends almost entirely on how you frame
 * the input. We use several techniques here:
 *
 *  1. SYSTEM PROMPT: Sets Claude's persona and hard constraints
 *     (e.g., "never diagnose", "always recommend consulting a doctor")
 *
 *  2. STRUCTURED DATA INJECTION: We serialize the user's actual
 *     data into the prompt as readable text so Claude can reason
 *     about patterns (e.g., sleep dropped when entering luteal phase)
 *
 *  3. OUTPUT FORMAT SPECIFICATION: We ask for JSON with specific
 *     fields so the UI can render insights in a structured way,
 *     not just a wall of text.
 *
 *  4. CONTEXT WINDOW: Everything sent in one API call — Claude
 *     has no memory between calls, so we always send all relevant
 *     context fresh each time.
 * ─────────────────────────────────────────────────────────────────
 */

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// This runs before every conversation and shapes Claude's behavior.
// "You are X" + hard rules + output format = consistent, safe output.
// ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are Big Sis, a compassionate women's health companion designed for college students.
You help users understand patterns in their cycle, sleep, caffeine, and mood data.

HARD RULES — never break these:
- Never diagnose medical conditions
- Never prescribe medications or supplements
- Always recommend consulting a healthcare provider for concerning patterns
- Be warm, non-judgmental, and age-appropriate for college students
- Keep suggestions practical and realistic for busy students
- Acknowledge data gaps — don't invent patterns from missing data

OUTPUT FORMAT — always return valid JSON with this structure:
{
  "summary": "2-3 sentence overview of what you see in their data",
  "insights": [
    {
      "category": "sleep|caffeine|cycle|mood|hormone|general",
      "title": "short insight title",
      "body": "2-3 sentence explanation with specific data references",
      "actionable": "one concrete suggestion they can try",
      "priority": "high|medium|low"
    }
  ],
  "phaseTip": "one specific tip relevant to their current cycle phase",
  "positives": ["something they're doing well", "another positive"],
  "disclaimer": "Remember: these insights are for personal awareness only and are not medical advice."
}

Limit to 3-4 insights maximum. Be specific, not generic.
`.trim();

// ─────────────────────────────────────────────────────────────────
// DATA FORMATTER
// Converts raw JS objects into readable text for the prompt.
// LLMs understand structured text better than raw JSON blobs.
// ─────────────────────────────────────────────────────────────────
function formatEntriesForPrompt(entries) {
  if (!entries || entries.length === 0) return "No daily log entries available.";

  return entries.map((e) => {
    const parts = [`Date: ${e.date}`];
    if (e.cyclePhase) parts.push(`Cycle phase: ${e.cyclePhase}`);
    if (e.cycleDay) parts.push(`Cycle day: ${e.cycleDay}`);
    if (e.sleepHours != null) parts.push(`Sleep: ${e.sleepHours}hrs (quality: ${e.sleepQuality}/5)`);
    if (e.caffeineServings != null) parts.push(`Caffeine: ${e.caffeineServings} serving(s)${e.caffeineMg ? ` (~${e.caffeineMg}mg)` : ""}`);
    if (e.lastCaffeineTime) parts.push(`Last caffeine: ${e.lastCaffeineTime}`);
    if (e.mood != null) parts.push(`Mood: ${e.mood}/5`);
    if (e.energy != null) parts.push(`Energy: ${e.energy}/5`);
    if (e.stress != null) parts.push(`Stress: ${e.stress}/5`);
    if (e.symptoms && e.symptoms.length > 0) parts.push(`Symptoms: ${e.symptoms.join(", ")}`);
    if (e.periodFlow && e.periodFlow !== "none") parts.push(`Flow: ${e.periodFlow}`);
    if (e.notes) parts.push(`Notes: "${e.notes}"`);
    return parts.join(" | ");
  }).join("\n");
}

function formatLabsForPrompt(labs) {
  if (!labs || labs.length === 0) return "No lab results uploaded.";

  return labs.map((lab) => {
    const lines = [`Lab results from ${lab.testDate || "unknown date"}:`];
    for (const [hormone, data] of Object.entries(lab.hormones || {})) {
      if (data.value != null) {
        const flag = data.flag && data.flag !== "normal" ? ` ⚑ ${data.flag.toUpperCase()}` : "";
        lines.push(`  ${hormone}: ${data.value} ${data.unit || ""}${data.referenceRange ? ` (ref: ${data.referenceRange})` : ""}${flag}`);
      }
    }
    if (lab.notes) lines.push(`  Notes: ${lab.notes}`);
    return lines.join("\n");
  }).join("\n\n");
}

function formatProfileForPrompt(profile) {
  if (!profile) return "No profile set up.";
  const parts = [];
  if (profile.firstName) parts.push(`Name: ${profile.firstName}`);
  if (profile.averageCycleLength) parts.push(`Average cycle: ${profile.averageCycleLength} days`);
  if (profile.conditions?.length > 0) parts.push(`Conditions: ${profile.conditions.join(", ")}`);
  if (profile.medications?.length > 0) parts.push(`Medications: ${profile.medications.join(", ")}`);
  if (profile.caffeineSensitivity) parts.push(`Caffeine sensitivity: ${profile.caffeineSensitivity}`);
  if (profile.goals?.length > 0) parts.push(`Goals: ${profile.goals.join(", ")}`);
  return parts.join(" | ") || "Basic profile.";
}

// ─────────────────────────────────────────────────────────────────
// MAIN FUNCTION: GET INSIGHTS
//
// Usage:
//   import { getInsights } from "./aiInsights.js";
//   const insights = await getInsights({
//     entries: getRecentEntries(7),
//     labs: getAllLabResults(),
//     profile: getProfile(),
//     currentPhase: getCyclePhase(cycleDay),
//     apiKey: "your-key"
//   });
// ─────────────────────────────────────────────────────────────────
export async function getInsights({ entries, labs, profile, currentPhase, apiKey }) {
  if (!apiKey) throw new Error("No API key provided");

  // Build the user message — this is what Claude "sees"
  const userMessage = `
Please analyze my wellness data from the past 7 days and give me personalized insights.

CURRENT STATUS:
${formatProfileForPrompt(profile)}
Current cycle phase: ${currentPhase?.name || "unknown"} — ${currentPhase?.description || ""}

DAILY LOGS (past 7 days, newest first):
${formatEntriesForPrompt(entries)}

LAB RESULTS:
${formatLabsForPrompt(labs)}

Please identify meaningful patterns and give me 3-4 specific, actionable insights.
Focus on how my cycle phase relates to my sleep, caffeine, and mood patterns.
`.trim();

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Claude API error: ${err.error?.message || response.status}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text;

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If Claude didn't return valid JSON for some reason, return a safe fallback
    console.warn("[aiInsights] Could not parse JSON response, returning raw text");
    return {
      summary: rawText,
      insights: [],
      phaseTip: "",
      positives: [],
      disclaimer: "These insights are for personal awareness only and are not medical advice.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// QUICK INSIGHT: PHASE-SPECIFIC CAFFEINE TIP
// A lighter version that doesn't require a full data snapshot.
// Good for showing in a sidebar or notification.
// ─────────────────────────────────────────────────────────────────
export async function getPhaseAwareCaffeineTip(phaseName, caffeineServings, apiKey) {
  if (!apiKey) throw new Error("No API key provided");

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `I'm in my ${phaseName} phase and had ${caffeineServings} caffeine servings today. 
Give me one specific, practical tip about caffeine timing or intake for this cycle phase. 
Be warm and brief (2 sentences max). No disclaimers needed.`,
      }],
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}