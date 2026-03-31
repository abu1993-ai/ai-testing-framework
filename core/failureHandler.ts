import { FailureType } from "./types/failureTypes";

export function shouldTerminate(failure: FailureType): boolean {
  return [
    FailureType.BACKEND_PRICING,
    FailureType.BACKEND_UNKNOWN,
    FailureType.STAGNATION,
    FailureType.FAILED
  ].includes(failure);
}

export function isRecoverable(failure: FailureType): boolean {
  return [
    FailureType.CAPABILITY_GAP_DELIVERY,
    FailureType.LLM_BEHAVIOR
  ].includes(failure);
}
