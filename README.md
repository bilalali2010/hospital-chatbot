# Demo Hospital Center — AI Patient Assistant

An AI-powered patient information chatbot for **Demo Hospital Center**, upgraded from the original rule-free single-model version to a 3-tier system that always answers — whether or not the AI model is reachable.

## What changed from the original hospital-chatbot

- **AI model swapped** to `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` (via OpenRouter), replacing `liquid/lfm-2.5-2.6b:free`.
- **104 quick-answer FAQs** added (`data/faqs.json`), auto-generated directly from `data/hospital.json` — every department, every doctor's timing and fee, every diagnostic test, emergency info, admission/room types, payment methods, and pharmacy details. Nothing invented; everything traces back to real data in the JSON.
- **3-tier answering system** (see below) instead of a single AI call with no fallback.
- **Redesigned interface** — clinical teal-and-navy identity, markdown-rendered replies (bold/bullets actually render instead of showing raw `**`/`-`), admin debug badges.
- **Security fix**: `ADMIN_PASSWORD` now comes from the environment instead of being hardcoded as `@supersecret`.
- **Next.js bumped** to `14.2.35` (patched; the original `14.1.0` had a known vulnerability).

## How it works

1. `data/hospital.json` holds the hospital's real facts — departments, doctors, timings, fees, diagnostics, emergency, admissions, payment, pharmacy.
2. `data/faqs.json` holds **104 curated FAQs** (question + keywords + ready-made answer), generated from that same data.
3. `app/api/chat/route.js` answers in three tiers:
   - **Tier 1 — instant FAQ match:** `lib/faqMatcher.js` scores the message against `faqs.json`. A confident match answers immediately — no AI call, instant, free, and works even with no API key configured.
   - **Tier 2 — AI model:** anything the FAQ set doesn't confidently cover goes to `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` via OpenRouter, with `hospital.json` as context and strict rules (no diagnoses/treatment advice, no appointment booking, admit when info is missing).
   - **Tier 3 — fallback:** if the AI call fails, times out (15s), or the key/quota isn't working, it falls back to the closest FAQ match at a lower confidence bar. If even that's empty, it points the user to the 24/7 emergency department or OPD reception instead of erroring out.
4. `app/ChatApp.jsx` is the chat widget UI — teal medical-cross seal, quick-reply buttons (Departments / Doctor Fees / OPD Timings / Emergency Care), an always-visible "Emergency 24/7" pill in the header, markdown-rendered replies, sticky input bar.
5. `app/api/admin/save/route.js` + `app/api/memory.js` are a simple in-memory hook for pushing updated business data at runtime, gated by `ADMIN_PASSWORD`.

## Setup

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local:
#   OPENROUTER_API_KEY = get a free key at https://openrouter.ai/keys
#   ADMIN_PASSWORD      = set your own strong password
npm run dev
```

Visit `http://localhost:3000` to chat.

## Checking whether the AI model is working

Open the chat with `?admin=1` in the URL (e.g. `http://localhost:3000?admin=1`). Every bot reply then shows a small badge next to its timestamp:

| Badge | Meaning |
|---|---|
| **FAQ** | Answered instantly by the local FAQ set — AI wasn't even called |
| **AI** | The AI model responded successfully |
| **FAQ (fallback)** | AI failed, but a related FAQ covered the question anyway |
| **AI unreachable** | AI is down and no FAQ matched — the user got the emergency/reception fallback message |

To specifically test the AI path, ask something outside the 104 FAQs that still needs reasoning over the data, e.g. *"If I see both a cardiologist and an orthopedic doctor, what's my total consultation cost?"*

## Updating the FAQ set

Edit `data/faqs.json` directly — each entry is `{ id, question, keywords, answer }`. Keep single-word keywords topic-specific (e.g. `"cardiology"`, not `"doctor"`) to avoid false matches; multi-word phrases are weighted higher than single words in the matcher.

## Notes

- The chatbot never gives medical diagnoses, treatment advice, or medication guidance — it's restricted to factual hospital information (departments, doctors, timings, fees, services) by the system prompt.
- `hospital.json` doesn't include a phone number or address, so the fallback message directs users to the 24/7 emergency department or OPD reception instead of inventing contact details.
