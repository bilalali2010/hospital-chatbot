import { getBusinessData } from "../memory";

export async function POST(req) {
  try {
    const { message } = await req.json();
    const businessData = getBusinessData();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            {
              role: "system",
              content: `You are a helpful business chatbot.

Use ONLY the information below to answer user questions.

${businessData || "No business information is available yet."}

If the answer is not found, reply exactly:
"I don't have that information yet."`,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return Response.json({
      reply: data.choices?.[0]?.message?.content || "Something went wrong.",
    });
  } catch (err) {
    return Response.json(
      { reply: "Server error occurred." },
      { status: 500 }
    );
  }
}
