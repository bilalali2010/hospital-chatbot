export async function POST(req) {
  const { message, businessData } = await req.json();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `You are a business assistant.
Only answer using the information below.

${businessData || "No business data provided."}

If the answer is not available, say:
"I don't have that information yet."`
        },
        {
          role: "user",
          content: message
        }
      ]
    })
  });

  const data = await response.json();

  return Response.json({
    reply: data.choices[0].message.content
  });
}
