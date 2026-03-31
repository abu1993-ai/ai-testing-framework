import { FailureType } from "./types/failureTypes";

export function classifyFailure(params: {
  botReply: any;
  previousReplies: string[];
  dbStatus?: string;
}): FailureType {

  const { botReply, previousReplies, dbStatus } = params;

  const reply = (botReply || "").toString().toLowerCase();

  // BACKEND PRICING
  if (
    reply.includes("price version not found") ||
    reply.includes("pricing not available") ||
    reply.includes("cannot find the price") ||
    reply.includes("trouble finding the price") ||
    reply.includes("item unavailable")
  ) {
    return FailureType.BACKEND_PRICING;
  }

  // DELIVERY NOT SUPPORTED
  if (
    reply.includes("delivery not available") ||
    reply.includes("only takeaway") ||
    reply.includes("pickup only")
  ) {
    return FailureType.CAPABILITY_GAP_DELIVERY;
  }

  // LLM FAILURE
  if (
    reply.includes("i don't understand") ||
    reply.includes("can you rephrase") ||
    reply.includes("something went wrong")
  ) {
    return FailureType.LLM_BEHAVIOR;
  }

  // STAGNATION
  const last3 = previousReplies.slice(-3);
  if (last3.length === 3 && last3.every(r => r === botReply)) {
    return FailureType.STAGNATION;
  }

  // DB FAILURE
  if (dbStatus && dbStatus !== "PAYMENT_PENDING") {
    if (dbStatus === "FAILED") {
      return FailureType.BACKEND_UNKNOWN;
    }
  }

// UNKNOWN FAILURE (fallback)
if (!reply || reply.length < 5) {
  return FailureType.FAILED;
}

// Generic failure (no progress)
if (
  reply.includes("technical difficulties") ||
  reply.includes("try again later") ||
  reply.includes("something went wrong")
) {
  return FailureType.LLM_BEHAVIOR;
}

return FailureType.NONE;
}