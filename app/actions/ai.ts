"use server";

export async function chatWithAI(messages: any[]) {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return { error: "AI_API_KEY is not configured in the environment." };
  }

  try {
    const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai",
        messages: messages,
      })
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || "API Error");
    }

    return { content: data.choices[0].message.content };
  } catch (error: any) {
    console.error("Error calling AI API:", error);
    return { error: error.message || "Failed to communicate with AI." };
  }
}
