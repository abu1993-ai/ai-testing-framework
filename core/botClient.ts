export const sendMessageToBot = async (message: string, waId: string) => {

  // ❌ DO NOT change waId
  const normalizedWaId = waId;

  const body = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "test-entry",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "TEST",
                phone_number_id: "TEST"
              },
              contacts: [
                {
                  profile: { name: "QA Tester" },
                  wa_id: normalizedWaId
                }
              ],
              messages: [
                {
                  from: normalizedWaId,
                  id: "wamid." + Date.now(),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: "text",
                  text: { body: message }
                }
              ]
            }
          }
        ]
      }
    ]
  };

  const response = await fetch(process.env.BOT_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return normalizedWaId;
};