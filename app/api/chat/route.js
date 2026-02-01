import { getBusinessData } from "../memory";

export async function POST(req) {
  const { message } = await req.json();
  const businessData = getBusinessData();

  const systemPrompt = `
You are a hospital assistant chatbot.

Rules:
- Answer ONLY using the provided information.
- You DO NOT have appointment booking capability.
- If user asks to book, say:
  "I can provide information, but I don't have an appointment booking option."
- If info is missing, say:
  "I don't have that information yet."

Hospital Information:
${businessData || "No data provided."}
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    }),
  });

  const data = await response.json();

  return Response.json({
    reply: data.choices?.[0]?.message?.content || "Something went wrong.",
  });
}
