import fs from "fs";
import path from "path";

export async function POST(req) {
  const { message } = await req.json();

  const filePath = path.join(process.cwd(), "data/hospital.json");
  const hospitalData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const systemPrompt = `
You are a professional hospital assistant chatbot.

STRICT RULES:
- Use ONLY the hospital information provided
- You do NOT book appointments
- If asked for booking, reply:
  "I can provide information, but I don’t have appointment booking capability."
- If info is missing, say:
  "I don't have that information yet."

Hospital Data:
${JSON.stringify(hospitalData, null, 2)}
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    }),
  });

  const data = await response.json();

  return Response.json({
    reply: data.choices?.[0]?.message?.content || "Sorry, something went wrong."
  });
}
