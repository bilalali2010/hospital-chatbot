// lib/faqMatcher.js
//
// Lightweight keyword matcher for the local FAQ set. No external
// dependencies, no network call — this is what lets the chatbot answer
// common questions instantly and reliably, whether or not the AI model
// is reachable.

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds the best-matching FAQ for a user message.
 *
 * @param {string} message - raw user input
 * @param {Array}  faqs - array of { id, question, keywords, answer }
 * @param {number} threshold - minimum score required to count as a match.
 *   Use a higher threshold (e.g. 3) for the "answer instantly, skip the AI"
 *   path, and a lower one (e.g. 1) for the "AI failed, best-effort fallback"
 *   path.
 * @returns {object|null} the matched FAQ object, or null if nothing clears
 *   the threshold.
 */
export function matchFaq(message, faqs, threshold = 3) {
  const normalizedMsg = normalize(message);
  if (!normalizedMsg) return null;

  const msgWords = normalizedMsg.split(" ");
  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    for (const rawKeyword of faq.keywords || []) {
      const keyword = normalize(rawKeyword);
      if (!keyword) continue;

      if (keyword.includes(" ")) {
        // Multi-word phrase: a direct substring hit is a strong, specific
        // signal — weighted above a bare single-word hit so a precise
        // phrase (e.g. "fee for intermediate") outranks a broader topic
        // word (e.g. "intermediate") on the same message.
        if (normalizedMsg.includes(keyword)) score += 4;
      } else if (msgWords.includes(keyword)) {
        // Single word: still a strong signal here, since every keyword
        // in the FAQ set was deliberately chosen to be topic-specific
        // (e.g. "mdcat", "cctv") rather than a generic word.
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  return bestScore >= threshold ? best : null;
}
