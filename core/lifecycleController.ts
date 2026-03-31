export function detectEscalation(botReply: string | null): boolean {
  if (!botReply) return false;

  const lower = botReply.toLowerCase();

  return (
    lower.includes("escalate") ||
    lower.includes("human") ||
    lower.includes("team member") ||
    lower.includes("connect you") ||
    lower.includes("transfer")
  );
}

export function detectHardFailure(botReply: string | null): boolean {
  if (!botReply) return true;

  const lower = botReply.toLowerCase();

  return (
    lower.includes("i'm not sure how to respond") ||
    lower.includes("i dont understand") ||
    lower.includes("cannot process")
  );
}

export function detectTakeawaySwitch(botReply: string | null): boolean {
  if (!botReply) return false;

  const lower = botReply.toLowerCase();

  return (
    lower.includes("takeaway") ||
    lower.includes("pickup")
  );
}