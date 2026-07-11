Diagnose and fix a failing test in this Playwright BDD project.

$ARGUMENTS

## Instructions

If the user provided a file path or error message in the arguments above, start there. Otherwise, run the tests first to identify failures:

```bash
npm test 2>&1
```

### Step 1 — Identify the failure

Look for:
- The failing feature file path
- The exact step that failed
- The full error message and stack trace

### Step 2 — Read the relevant files

For the failing test, read:
1. The `.feature` file
2. The step definitions file (`steps/.../*.steps.ts`)
3. The page object file (`pages/.../*.ts`)

### Step 3 — Inspect the live page only if the error is locator-related

Only do this step if the error is: "element not found", "timeout waiting for locator", "strict mode violation", or similar. Skip for logic/assertion errors.

**Primary (low-token):** run the inspect script against the failing page:

```bash
node scripts/inspect-page.mjs https://automationintesting.online/<failing-path>
```

The script outputs a `locators` array per element, already sorted by Playwright's recommended priority:
```json
{
  "tag": "button",
  "locators": [
    "getByRole('button', { name: 'Sign in' })",
    "getByTestId('login-btn')",
    "locator('#doLogin')"
  ]
}
```

Take the top 3 entries from the matching element's `locators` array for the fix in Step 4.

**Fallback (only if the script fails or returns empty results):** use the Playwright MCP with a single `browser_navigate` + `browser_snapshot` call. Do not take screenshots. Extract the element's role, label, placeholder, testid, and id from the snapshot output. This fallback costs more tokens — use it only when the script fails.

### Step 4 — Diagnose the root cause

Common causes:
- **Locator broken**: selector changed → replace the broken locator in the page object with `this.robustLocator()` using the top 3 entries from the script output, prefixed with `this.page.`:
  ```ts
  // Before (fragile)
  this.loginButton = this.page.locator('#doLogin');

  // After (robust)
  this.loginButton = this.robustLocator(
    this.page.getByRole('button', { name: 'Sign in' }),
    this.page.getByTestId('login-btn'),
    this.page.locator('#doLogin'),
  );
  ```
  If the broken locator is already a `robustLocator()` call, just add or swap the failing option.
- **Step not matched**: step text in `.feature` doesn't match step definition → align them
- **Missing step**: no matching step definition → create it
- **Missing `await`**: async call without await → add it
- **Wrong assertion**: `expect()` condition wrong → fix it
- **Test data**: wrong values in `fixtures/testData.json` → update them

### Step 5 — Apply the fix

Edit only what's broken. No unrelated refactoring.

### Step 6 — Verify

```bash
npm test
```

### Output

Report: what was broken, what you changed, and which files were modified.
