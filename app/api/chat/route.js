import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message;

    const filePath = path.join(process.cwd(), "data", "hospital.json");
    const hospitalData = fs.readFileSync(filePath, "utf-8");

    const systemPrompt =
      "You are a hospital assistant chatbot.\n\n" +
      "Rules:\n" +
      "- Answer ONLY using the hospital information below\n" +
      "- You do NOT have appointment booking capability\n" +
      "- If asked to book an appointment, say:\n" +
      "  I can provide information, but I don’t have appointment booking capability.\n" +
      "- If information is missing, say:\n" +
      "  I don't have that information yet.\n\n" +
      "Hospital Information:\n" +
      hospitalData;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply:
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content
            ? data.choices[0].message.content
            : "I don't have that information yet."
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ reply: "Server error. Please try again." }),
      { status: 500 }
    );
  }
}
