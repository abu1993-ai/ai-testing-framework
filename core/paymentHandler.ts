import { chromium } from "@playwright/test";

export async function completeSandboxPayment(paymentUrl: string) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const [paymentPage] = await Promise.all([
    context.waitForEvent("page"),
    page.goto(paymentUrl)
  ]);

  await paymentPage.waitForLoadState();

  await paymentPage.waitForTimeout(3000);

  try {
  // STEP 1 — click VISA (or any card option)
  await paymentPage.click('img[alt="visa"], img[alt="mastercard"]');

  // wait for card form to load
  await paymentPage.waitForSelector('input[name="cardNo"]', { timeout: 10000 });

  // STEP 2 — fill card details
  await paymentPage.fill('input[name="cardNo"]', '4111111111111111');
  await paymentPage.fill('input[name="cardHolderName"]', 'Test User');
  await paymentPage.fill('input[name="expiryMonth"]', '12');
  await paymentPage.fill('input[name="expiryYear"]', '30');
  await paymentPage.fill('input[name="cvv"]', '123');

  // STEP 3 — submit
  await paymentPage.click('button[type="submit"]');

} catch (e) {
  console.log("⚠️ Fallback: trying iframe");

  const frame = paymentPage.frameLocator("iframe");

  await frame.locator('img[alt="visa"]').click();

  await frame.locator('input[name="cardNo"]').fill('4111111111111111');
  await frame.locator('input[name="cardHolderName"]').fill('Test User');
  await frame.locator('input[name="expiryMonth"]').fill('12');
  await frame.locator('input[name="expiryYear"]').fill('30');
  await frame.locator('input[name="cvv"]').fill('123');

  await frame.locator('button[type="submit"]').click();
}

  await paymentPage.waitForTimeout(5000);

  await browser.close();
}