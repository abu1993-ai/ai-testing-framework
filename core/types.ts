export type ConversationStep = {
  id: string;
  userIntent: string;          // abstract intent (NOT raw prompt)
  expectedOutcome: string;     // what bot should achieve
};

export type ConversationScript = {
  name: string;
  steps: ConversationStep[];
};

export type BotReply = {
  stepId: string;
  reply: string;
};

export type EvaluationResult = {
  stepId: string;
  score: number;      // 0–100
  pass: boolean;
  reasoning: string;
};

