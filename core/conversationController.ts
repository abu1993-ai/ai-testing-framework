type ConversationState = {
  goal: string;
  completed: boolean;
  lastIntent?: string;
};

export function initialState(goal: string): ConversationState {
  return {
    goal,
    completed: false
  };
}

export function guardrailDecision(botReply: any): string | null {

  const lower = (botReply || "").toString().toLowerCase();

  if (lower.includes("mild") && lower.includes("spice")) {
    return "confirm_mild_spice";
  }

  return null;
}

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.VERCEL_AI_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1"
});

const MODEL = "openai/gpt-5-mini";

export async function llmDecision(goal: string, botReply: string): Promise<string> {

  const prompt = `
You are controlling a QA test agent.

User Goal: ${goal}

Bot Reply:
${botReply}

Decide next user action.
Return only ONE short intent label.
Examples:
- confirm_mild_spice
- confirm_standard_size
- provide_missing_info
- ask_for_total
- confirm_order
- conversation_complete
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  return response.choices[0].message.content!.trim();
}

export async function decideNextIntent(
  state: ConversationState,
  botReply: string
): Promise<string> {

const guardrail = guardrailDecision(
  typeof botReply === "string" ? botReply : botReply?.lastReply
);

  if (guardrail) {
    return guardrail;
  }

  return await llmDecision(state.goal, botReply);
}


