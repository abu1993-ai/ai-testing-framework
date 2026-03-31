export function updateStateFromReply(state: any, reply: string) {
  const text = (reply || "").toLowerCase();

  // ITEM
  if (text.includes("biryani")) state.item = "biryani";
  if (text.includes("burger")) state.item = "burger";

  // SIZE
  if (text.includes("large")) state.size = "large";
  if (text.includes("standard")) state.size = "standard";

  // ADDRESS
  if (text.includes("street") || text.includes("st")) {
    state.addressCaptured = true;
  }

  // PAYMENT STEP
  if (text.includes("payment") || text.includes("checkout")) {
    state.paymentInitiated = true;
  }

  return state;
}