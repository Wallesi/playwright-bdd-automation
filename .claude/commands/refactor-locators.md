Refactor existing page objects to use robust locators following Playwright's recommended priority.

$ARGUMENTS

## Instructions

If a specific file path is provided in the arguments, refactor only that file. Otherwise, refactor all page objects.

---

### Step 1 — Find page objects with fragile locators

Scan all files in `pages/` recursively. Identify every file that contains at least one `this.page.locator(` call that is NOT already wrapped in `this.robustLocator()`.

List the files found before proceeding.

---

### Step 2 — For each file, extract the page URL

Read the file and find the `open()` method to get the page path (e.g. `/admin`). The full URL will be `https://automationintesting.online<path>`.

If no `open()` method exists, infer the URL from the class name or directory structure.

---

### Step 3 — Get semantic locators for that page

**Primary:** run the inspect script:

```bash
node scripts/inspect-page.mjs https://automationintesting.online/<path>
```

**Fallback (only if the script fails or returns empty):** use the Playwright MCP with a single `browser_navigate` + `browser_snapshot`. No screenshots.

---

### Step 4 — Refactor the locators

For each `this.page.locator(...)` call in the file that is not already a `robustLocator`:

1. Identify which element it targets (by selector value)
2. Find that element in the script output's `locators` array
3. Replace the single locator with `this.robustLocator()` using the top 3 options from the array, prefixed with `this.page.`:

```ts
// Before
this.loginButton = this.page.locator('#doLogin');

// After
this.loginButton = this.robustLocator(
  this.page.getByRole('button', { name: 'Sign in' }),
  this.page.getByTestId('login-btn'),
  this.page.locator('#doLogin'),
);
```

**Rules:**
- Use Playwright's priority: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > `locator`
- Always keep the original selector as the last fallback in the chain
- If the script returns fewer than 3 options for an element, use however many are available
- Do NOT change method names, assertions, or any logic — only the locator declarations in the constructor

---

### Step 5 — Verify nothing broke

After refactoring all files, run the full test suite:

```bash
npm test
```

If any test fails after the refactor, read the error and revert only the locator that caused the failure, keeping the original single `page.locator()` for that element. Document which locator could not be upgraded and why.

---

### Output

Print a summary table:

| File | Locators refactored | Locators skipped (reason) |
|---|---|---|
| pages/admin/LoginPage.ts | 3 | 0 |
| pages/landing/LandingPage.ts | 2 | 1 (element not found in script output) |