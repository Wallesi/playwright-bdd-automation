import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const positionalSelector = args.filter((a) => !a.startsWith('--'))[1];
const clickFlag = args.find((a) => a.startsWith('--click='))?.slice('--click='.length);
const captureFlag = args.find((a) => a.startsWith('--capture='))?.slice('--capture='.length);

if (!url) {
  console.error('Usage: node scripts/inspect-page.mjs <url> [selector] [--click=<buttonText>] [--capture=<cssSelector>]');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/inspect-page.mjs https://example.com');
  console.error('  node scripts/inspect-page.mjs https://example.com .room-card');
  console.error('  node scripts/inspect-page.mjs https://example.com --click=Submit --capture=.alert-danger');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle' });

// --click: click a button by visible text, then wait for DOM to settle
if (clickFlag) {
  await page.getByRole('button', { name: clickFlag }).click();
  await page.waitForTimeout(1500);
}

// --capture or positional selector: dump matching elements and their children
const selector = captureFlag ?? positionalSelector;
if (selector) {
  const matches = await page.$$eval(selector, (els) =>
    els.map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 200),
      children: Array.from(el.querySelectorAll('*'))
        .slice(0, 20)
        .map((c) => ({
          tag: c.tagName.toLowerCase(),
          class: c.className || undefined,
          text: c.textContent?.trim().slice(0, 100) || undefined,
        }))
        .filter((c) => c.text),
    })),
  );
  console.log(JSON.stringify(matches, null, 2));
} else {
  // Default: dump all interactive elements with their Playwright locators
  const elements = await page.$$eval(
    'input, button, select, textarea, a[href], [role="button"], [role="link"], [role="alert"], [role="dialog"]',
    (els) =>
      els
        .map((el) => {
          const locators = [];

          const role = el.getAttribute('role') || el.tagName.toLowerCase();
          const ariaLabel = el.getAttribute('aria-label');
          const text = el.textContent?.trim().slice(0, 60);
          const labelFor = el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() : null;
          const placeholder = el.getAttribute('placeholder');
          const testId = el.getAttribute('data-testid');
          const id = el.id;
          const name = el.getAttribute('name');

          if (ariaLabel) locators.push(`getByRole('${role}', { name: '${ariaLabel}' })`);
          else if (text && el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && el.tagName !== 'TEXTAREA')
            locators.push(`getByRole('${role}', { name: '${text}' })`);

          if (labelFor) locators.push(`getByLabel('${labelFor}')`);
          if (placeholder) locators.push(`getByPlaceholder('${placeholder}')`);
          if (testId) locators.push(`getByTestId('${testId}')`);
          if (id) locators.push(`locator('#${id}')`);
          if (name && !id) locators.push(`locator('[name="${name}"]')`);

          return locators.length > 0
            ? {
                tag: el.tagName.toLowerCase(),
                type: el.getAttribute('type') || undefined,
                locators,
              }
            : null;
        })
        .filter(Boolean),
  );
  console.log(JSON.stringify(elements, null, 2));
}

await browser.close();
