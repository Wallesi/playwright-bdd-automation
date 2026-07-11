Create a complete test for this Playwright BDD project based on the following description:

$ARGUMENTS

## Instructions

### Step 0 — Inspect the real page

**Primary (low-token):** run the inspect script:

```bash
node scripts/inspect-page.mjs https://automationintesting.online/<path>
```

Replace `<path>` with the page path relevant to the feature being tested. If the page requires login first, run the script against `/admin` first, then against the target page.

**Fallback (only if the script fails or returns empty results):** use the Playwright MCP with a single `browser_navigate` + `browser_snapshot` call. Do not take screenshots. This fallback costs more tokens — use it only when the script fails.

---

### Step 1 — Read existing project conventions (run in parallel with Step 0)

Read these files to match the exact code style:

- `pages/BasePage.ts`
- `pages/admin/LoginPage.ts`
- `steps/admin/login/login.steps.ts`
- `features/admin/login/login.feature`

---

### Step 2 — Create the 3 files

**Feature file → `features/<area>/<feature-name>/<name>.feature`**

- `Feature:` with 3-line user story
- `Background:` for shared preconditions
- `@smoke` on the happy path scenario
- Use `{string}` / `{int}` for parameterized steps
- Use `Scenario Outline:` + `Examples:` for data-driven cases

**Page Object → `pages/<area>/<FeatureName>Page.ts`**

- `import { Page, Locator } from '@playwright/test'`
- `import { BasePage } from '../BasePage'` (adjust path)
- Extends `BasePage`
- All locators as `private readonly` using `this.robustLocator()` with up to 3 `Locator` objects from the script output
- Follow Playwright's recommended priority (most to least resilient):
  1. `this.page.getByRole('button', { name: 'Sign in' })`
  2. `this.page.getByLabel('Username')`
  3. `this.page.getByPlaceholder('Enter username')`
  4. `this.page.getByTestId('login-btn')`
  5. `this.page.locator('#doLogin')` ← last resort only
- Expose locators needed for assertions as `get` properties returning `Locator`
- Methods use `this.fill()`, `this.click()`, `this.getText()` from BasePage
- **MANDATORY: always include `isLoaded()`** — waits for the most reliable sentinel element of the page (e.g. main heading, submit button, or nav). Use `await this.waitForVisible(this.someLocator)`. Must throw on timeout.
- **MANDATORY: `open()` must always call `await this.isLoaded()`** after `await this.goto('/path')`. Never leave `open()` without this call.
- If the page has no `open()` (reached via click), still add `isLoaded()` so step definitions can call it after navigation.

Example `isLoaded` + `open` pattern:

```ts
async isLoaded(): Promise<void> {
  await this.waitForVisible(this.usernameInput);
}

async open(): Promise<void> {
  await this.goto('/admin');
  await this.isLoaded();
}
```

Example locator pattern:

```ts
this.loginButton = this.robustLocator(
  this.page.getByRole('button', { name: 'Sign in' }),
  this.page.getByTestId('login-btn'),
  this.page.locator('#doLogin'),
);
```

**Step definitions → `steps/<area>/<feature-name>/<name>.steps.ts`**

- `import { expect } from '@playwright/test'`
- `import { createBdd } from 'playwright-bdd'`
- `const { Given, When, Then } = createBdd()`
- Each step uses `async ({ page }) =>` callback
- Instantiate the page object inside each step
- String params typed as `string`, ints as `number`

---

### Step 3 — Summary

Print:

- The 3 file paths created
- The selectors used and where they came from in the script output
- Any manual steps needed (e.g. test data to add to `fixtures/testData.json`)
