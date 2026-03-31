import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.VERCEL_AI_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1"
});

const MODEL = "openai/gpt-5-mini";

export async function evaluateResponse(
  intent: string,
  expectedOutcome: string,
  aiReply: string
) {
  const prompt = `
You are evaluating a restaurant AI chatbot.

User Intent: ${intent}
Expected Outcome: ${expectedOutcome}

AI Reply:
${aiReply}

Score from 0 to 100.
Return STRICT JSON:
{
  "score": number,
  "pass": boolean,
  "reason": "short explanation"
}

Pass if score >= 70.
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content!);
}
