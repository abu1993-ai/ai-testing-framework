import OpenAI from "openai";
import "./env";

const client = new OpenAI({
  apiKey: process.env.VERCEL_AI_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1"
});

const MODEL = "openai/gpt-5-mini";

export async function generateUserMessage(input: {
  intent: string;
  goal: string;
  previousBotReply: string;
}) {

  const { intent, goal, previousBotReply } = input;

  const prompt = `
You are simulating a realistic customer in a WhatsApp conversation with a restaurant AI waiter.

Goal: ${goal}
Intent: ${intent}

CRITICAL RULE:
- You MUST follow the intent exactly.

Previous Bot Reply:
${previousBotReply}

Respond with ONLY the next user message.
`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    return response.choices[0].message.content!.trim();

  } catch (err) {
    console.log("⚠️ LLM FAILED → using fallback");

    // ✅ fallback messages
    const fallback: any = {
      greet_and_ask_menu: "Hi, can I see the menu?",
      browse_menu_then_order: "Can you show me the menu?",
      order_chicken_biryani: "One chicken biryani please",
      ask_total_price: "What is the total price?",
      order_burger: "One burger please"
    };

    return fallback[intent] || "Hi";
  }
}