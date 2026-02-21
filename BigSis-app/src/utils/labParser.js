/**
 * labParser.js
 * ─────────────────────────────────────────────────────────────────
 * TECHNOLOGY: Anthropic Claude API + FileReader API + Base64 encoding.
 *
 * HOW FILE UPLOAD WORKS IN THE BROWSER:
 * 1. User selects a file via <input type="file">
 * 2. FileReader API (built into browser) reads it as binary
 * 3. We convert binary → Base64 string (text representation of binary)
 * 4. We send the Base64 + media type to Claude's API
 * 5. Claude reads the PDF/image and extracts structured data
 * 6. Claude returns JSON with the hormone values
 *
 * BASE64 explained: Binary data (like a PDF) can't be sent as text
 * directly. Base64 encodes every 3 bytes of binary into 4 printable
 * ASCII characters. It makes files ~33% larger but makes them safe
 * to transmit as text in JSON.
 *
 * The Claude API accepts:
 *   - PDFs as { type: "document", source: { type: "base64", ... } }
 *   - Images as { type: "image", source: { type: "base64", ... } }
 * ─────────────────────────────────────────────────────────────────
 */

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ─────────────────────────────────────────────────────────────────
// 1. FILE → BASE64
//    Reads a File object (from <input type="file">) and returns
//    a Base64 string. Uses a Promise to handle the async FileReader.
// ─────────────────────────────────────────────────────────────────
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // onload fires when FileReader finishes reading
    reader.onload = () => {
      // result looks like: "data:application/pdf;base64,JVBERi0xL..."
      // We only want the part after the comma
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    // readAsDataURL converts binary to base64 data URL
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────
// 2. DETERMINE MEDIA TYPE
//    Claude needs to know if we're sending a PDF or image.
// ─────────────────────────────────────────────────────────────────
function getMediaType(file) {
  const type = file.type.toLowerCase();
  if (type === "application/pdf") return "application/pdf";
  if (type.startsWith("image/")) return type; // "image/png", "image/jpeg", etc.
  throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF or image.`);
}

// ─────────────────────────────────────────────────────────────────
// 3. BUILD THE PROMPT
//    Tells Claude exactly what to look for and how to format output.
//    Asking for JSON output + giving an exact schema = reliable extraction.
// ─────────────────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `
You are a medical document parser. Extract hormone and lab values from this document.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "testDate": "YYYY-MM-DD or null if not found",
  "labName": "name of the lab/clinic or null",
  "hormones": {
    "estradiol":    { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "progesterone": { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "fsh":          { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "lh":           { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "testosterone": { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "dheas":        { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "tsh":          { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "cortisol":     { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" },
    "amh":          { "value": number_or_null, "unit": "string_or_null", "referenceRange": "string_or_null", "flag": "normal|high|low|null" }
  },
  "otherValues": [],
  "notes": "any important observations about the results, or empty string"
}

Rules:
- Set value to null if a hormone is not present in the document
- Preserve the exact units from the document
- Include reference ranges exactly as written
- Flag as "high" or "low" if the document marks them as abnormal, otherwise "normal"
- Do not interpret, diagnose, or add medical advice
`.trim();

// ─────────────────────────────────────────────────────────────────
// 4. MAIN FUNCTION: PARSE LAB FILE
//    Takes a File object, returns structured lab data.
//
//    Usage:
//      const input = document.getElementById("lab-upload");
//      input.addEventListener("change", async (e) => {
//        const result = await parseLabFile(e.target.files[0], apiKey);
//        console.log(result.hormones.estradiol); // { value: 127, unit: "pg/mL", ... }
//      });
// ─────────────────────────────────────────────────────────────────
export async function parseLabFile(file, apiKey) {
  if (!file) throw new Error("No file provided");
  if (!apiKey) throw new Error("No API key provided");

  // Step 1: Convert file to base64
  const base64Data = await fileToBase64(file);
  const mediaType = getMediaType(file);

  // Step 2: Build the message content
  // Claude accepts documents and images as content blocks alongside text
  const contentBlock = mediaType === "application/pdf"
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64Data },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64Data },
      };

  // Step 3: Call the Claude API
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Note: in Claude.ai artifacts the API key is handled automatically
      // In a standalone app, pass your key here
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Claude API error: ${err.error?.message || response.status}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text;

  // Step 4: Parse the JSON response
  // Claude sometimes wraps JSON in ```json ... ``` — strip that
  const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Step 5: Attach metadata
  return {
    ...parsed,
    sourceFileName: file.name,
    uploadedAt: new Date().toISOString(),
    rawExtractedText: rawText,
  };
}
