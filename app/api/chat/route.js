import fs from "fs";
import path from "path";
import { matchFaq } from "@/lib/faqMatcher";

const AI_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
const AI_TIMEOUT_MS = 15000;

function loadJson(fileName) {
  const filePath = path.join(process.cwd(), "data", fileName);
  return fs.readFileSync(filePath, "utf-8");
}

function buildSystemPrompt(hospitalDataRaw) {
  return (
    "You are the patient information assistant for Demo Hospital Center.\n\n" +
    "Rules:\n" +
    "- Answer ONLY using the hospital information below\n" +
    "- You do NOT have appointment booking capability\n" +
    "- If asked to book an appointment, say:\n" +
    "  I can provide information, but I don't have appointment booking capability. Please visit our OPD reception or call the hospital directly.\n" +
    "- Never give medical diagnoses, treatment advice, or medication recommendations — only factual information about departments, doctors, timings, fees, and services.\n" +
    "- If information is missing from the data below, say:\n" +
    "  I don't have that information yet.\n" +
    "- Keep answers friendly, concise, and on-topic (departments, doctors, timings, fees, diagnostics, emergency, admissions, payment, pharmacy).\n" +
    "- Format every answer in clean markdown:\n" +
    "  * Put each bullet point on its OWN LINE, starting with \"- \".\n" +
    "  * Use **bold** only for headings and key labels (e.g. **Timing:**), not entire sentences.\n" +
    "  * Never place multiple bullet points on the same line.\n" +
    "  * Keep paragraphs short (1-3 sentences) and separate distinct ideas with a blank line.\n\n" +
    "Hospital Information:\n" +
    hospitalDataRaw
  );
}

function contactFallbackReply() {
  return (
    "I'm having trouble reaching our AI assistant right now, so I can't fully answer that " +
    "one. For urgent help, please visit our **Emergency department (available 24/7)**, or " +
    "speak to our OPD reception directly for further assistance."
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message || "";

    const hospitalDataRaw = loadJson("hospital.json");
    const faqs = JSON.parse(loadJson("faqs.json"));

    // --- Tier 1: instant local FAQ match -----------------------------
    // Answers common questions immediately, with zero dependency on the
    // AI model being reachable, configured, or within quota.
    const instantMatch = matchFaq(message, faqs, 3);
    if (instantMatch) {
      return Response.json({ reply: instantMatch.answer, source: "faq" });
    }

    // --- Tier 2: AI model, for anything the FAQ set doesn't cover -----
    const systemPrompt = buildSystemPrompt(hospitalDataRaw);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: AI_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ]
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      const aiReply = data?.choices?.[0]?.message?.content;

      if (response.ok && aiReply) {
        return Response.json({ reply: aiReply, source: "ai" });
      }
      throw new Error("AI response missing or request failed");
    } catch (aiError) {
      // --- Tier 3: AI unreachable / errored / timed out ---------------
      // Fall back to the closest FAQ match at a lower confidence bar
      // before giving up and pointing the user toward reception/emergency.
      const fallbackMatch = matchFaq(message, faqs, 1);
      if (fallbackMatch) {
        return Response.json({
          reply: fallbackMatch.answer,
          source: "faq-fallback"
        });
      }

      return Response.json({
        reply: contactFallbackReply(),
        source: "contact-fallback"
      });
    }
  } catch (error) {
    return Response.json(
      { reply: "Server error. Please try again.", source: "error" },
      { status: 500 }
    );
  }
}
