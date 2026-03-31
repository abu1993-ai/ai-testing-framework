import { test } from '@playwright/test';
import { ConversationScript } from '../core/types';
import { generateUserMessage } from '../core/llmClient';

const orderFoodScript: ConversationScript = {
  name: "Order Chicken Biryani",
  steps: [
    {
      id: "step1",
      userIntent: "greet_and_ask_menu",
      expectedOutcome: "bot provides menu options"
    },
    {
      id: "step2",
      userIntent: "order_chicken_biryani",
      expectedOutcome: "bot confirms chicken biryani order"
    },
    {
      id: "step3",
      userIntent: "ask_total_price",
      expectedOutcome: "bot provides total price"
    }
  ]
};

test('generate dynamic user messages', async () => {
  for (const step of orderFoodScript.steps) {
    const message = await generateUserMessage(step.userIntent);
    console.log(`Intent: ${step.userIntent}`);
    console.log(`Generated Message: ${message}`);
    console.log('------------------------');
  }
});
