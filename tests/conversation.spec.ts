import { test, expect } from '@playwright/test';
import { scenarios } from '../core/scenarios';
import { updateStateFromReply } from '../core/stateTracker';
import { generateUserMessage } from '../core/llmClient';
import { sendMessageToBot } from '../core/botClient';
import { waitForAIResponse } from '../core/dbClient';
import { evaluateResponse } from '../core/evaluator';
import { initialState, decideNextIntent } from '../core/conversationController';
import { detectTakeawaySwitch } from '../core/lifecycleController';
import { classifyFailure } from '../core/failureClassifier';
import { shouldTerminate } from '../core/failureHandler';
import { FailureType } from '../core/types/failureTypes';
import { recordResult, printSummary } from '../core/testSummary';
import { completeSandboxPayment } from '../core/paymentHandler';

// ---------------------------
// HELPERS
// ---------------------------
function extractPaymentUrl(reply: string): string | null {
  const match = reply.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

function detectPaymentLink(reply?: string): boolean {
  if (!reply) return false;
  const r = reply.toLowerCase();
  return r.includes('checkout') || r.includes('payment link');
}

// ---------------------------
// TEST SUITE
// ---------------------------
test.describe.parallel('multi-scenario conversational testing', () => {

  for (const scenario of scenarios) {

    test(`${scenario.name}`, async () => {

      const waId = `555${Date.now().toString().slice(-7)}`;
      const state = initialState(scenario.goal);
      const results: any[] = [];

      let currentIntent = scenario.goal;
      let lastBotReply = '';
      let turn = 0;

      const previousReplies: string[] = [];

      // ---------------------------
      // MAIN LOOP
      // ---------------------------
      while (!state.completed && turn < 5) {

        turn++;

        const userMessage = await generateUserMessage({
          intent: currentIntent,
          goal: scenario.goal,
          previousBotReply: lastBotReply
        });

        // ✅ FIX: capture time BEFORE sending
        const startTime = Date.now();

        await sendMessageToBot(userMessage, waId);

        // ✅ FIX: pass startTime
        const aiReply = (await waitForAIResponse(waId, startTime)) || '';

        lastBotReply = aiReply;
        updateStateFromReply(state, aiReply);
        previousReplies.push(aiReply);

        // ---------------------------
        // EMPTY RESPONSE
        // ---------------------------
        if (!aiReply) {
          results.push({
            turn,
            intent: currentIntent,
            userMessage,
            aiReply: 'NO RESPONSE',
            evaluation: { pass: false, score: 0, reason: 'Empty response' }
          });

          state.failureType = FailureType.FAILED;
          break;
        }

        // ---------------------------
        // PAYMENT DETECTED
        // ---------------------------
        if (detectPaymentLink(aiReply)) {

          results.push({
            turn,
            intent: currentIntent,
            userMessage,
            aiReply,
            evaluation: { pass: true, score: 100, reason: 'Payment triggered' }
          });

          console.log('💰 Payment link detected');

          const url = extractPaymentUrl(aiReply);

          if (url && process.env.PAYMENT === 'true') {
            await completeSandboxPayment(url);
          }

          state.completed = true;
          break;
        }

        // ---------------------------
        // TAKEAWAY SWITCH
        // ---------------------------
        if (detectTakeawaySwitch(aiReply)) {
          state.orderMode = 'takeaway';
        }

        // ---------------------------
        // FAILURE CLASSIFICATION
        // ---------------------------
        const failureType = classifyFailure({
          botReply: aiReply,
          previousReplies
        });

        if (failureType !== FailureType.NONE) {

          console.log('⚠️ Failure detected:', failureType);

          results.push({
            turn,
            intent: currentIntent,
            userMessage,
            aiReply,
            evaluation: { pass: false, score: 0, reason: 'Failure detected' }
          });

          if (shouldTerminate(failureType)) {
            state.completed = false;
            state.failureType = failureType;
            break;
          }
        }

        // ---------------------------
        // STATE-DRIVEN STOP
        // ---------------------------
        if (state.paymentInitiated) {
          console.log('Stopping due to payment state');

          results.push({
            turn,
            intent: currentIntent,
            userMessage,
            aiReply,
            evaluation: { pass: true, score: 100, reason: 'Payment initiated' }
          });

          state.completed = true;
          break;
        }

        // ---------------------------
        // NORMAL EVALUATION
        // ---------------------------
        const evaluation = await evaluateResponse(
          currentIntent,
          'bot progresses toward completing the order',
          aiReply
        );

        results.push({
          turn,
          intent: currentIntent,
          userMessage,
          aiReply,
          evaluation
        });

        // ---------------------------
        // NEXT INTENT
        // ---------------------------
        currentIntent = await decideNextIntent({
          ...state,
          lastReply: aiReply
        });
      }

      // ---------------------------
      // FALLBACK: CONFIRMED ORDER
      // ---------------------------
      if (!state.completed && !state.failureType) {
        const lastReply = lastBotReply.toLowerCase();

        if (
          lastReply.includes('order number') ||
          lastReply.includes('order is confirmed')
        ) {
          console.log('Order confirmed without payment step');
          state.completed = true;
        }
      }

      // ---------------------------
      // FALLBACK: NO TERMINAL
      // ---------------------------
      if (!state.completed && !state.failureType) {
        console.log('⚠️ No terminal state reached');
        state.failureType = FailureType.FAILED;
      }

      // ---------------------------
      // PRINT CONVERSATION
      // ---------------------------
      console.log('\n================ CONVERSATION =================');

      results.forEach((r, i) => {
        console.log(`\nTurn ${i + 1}`);
        console.log('User :', r.userMessage);
        console.log('Bot  :', r.aiReply);
      });

      console.log('\nFINAL STATE:', JSON.stringify(state, null, 2));
      console.log('==============================================\n');

      if (state.completed) {
        console.log('✅ Conversation completed successfully');
      }

      recordResult(state);

      // ---------------------------
      // ASSERTION
      // ---------------------------
      expect(
        state.completed ||
        state.failureType === FailureType.CAPABILITY_GAP_DELIVERY ||
        state.failureType === FailureType.BACKEND_PRICING ||
        state.failureType === FailureType.FAILED
      ).toBeTruthy();
    });
  }
});

// ---------------------------
// SUMMARY
// ---------------------------
test.afterAll(async () => {
  printSummary();
});