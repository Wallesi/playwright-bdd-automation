# Playwright Automation Framework

End-to-end automation framework using **Playwright** + **playwright-bdd (Gherkin/Cucumber syntax)** + **Page Object Model**, written in TypeScript.

## Folder structure

```
├── features/                        # Gherkin specs, grouped by site section
│   ├── admin/
│   │   ├── login/
│   │   │   └── login.feature
│   │   └── dashboard/
│   │       └── dashboard.feature
│   └── landingPage/
│       └── landingPage.feature
├── steps/                           # Step definitions, mirroring features/ structure
│   ├── admin/
│   │   ├── login/
│   │   │   └── login.steps.ts
│   │   └── dashboard/
│   │       └── dashboard.steps.ts
│   └── landingPage/
│       └── landingPage.steps.ts
├── pages/                           # Page Objects (POM)
│   ├── BasePage.ts                  # Shared base with click/fill/getText helpers
│   ├── admin/
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   └── landing/
│       └── LandingPage.ts
├── utils/                           # Reusable helpers
│   ├── commonUtils.ts
│   └── dateUtils.ts
├── fixtures/                        # Test data
│   └── testData.json
├── .features-gen/                   # Playwright specs auto-generated from .feature files (git-ignored)
├── playwright-report/               # Playwright HTML report (generated, git-ignored)
├── cucumber-report/                 # Cucumber HTML report (generated, git-ignored)
├── test-results/                    # Traces/screenshots/videos per test (generated, git-ignored)
├── playwright.config.ts             # Playwright + BDD config: browsers, workers, reporters
└── tsconfig.json
```

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
npx playwright install
```

Create a `.env` file at the project root (see environment variables below). No secrets are stored — only run configuration.

## Running the tests

```bash
npm test                       # generate specs from .feature files and run all tests
npm run test:ui                # open Playwright UI mode to run tests interactively
npm run test:tags -- "@smoke"  # run only scenarios tagged @smoke
npm run test:report            # open the last Playwright HTML report
```

Relevant environment variables:

| Variable   | Description                            | Default               |
| ---------- | -------------------------------------- | --------------------- |
| `BASE_URL` | Base URL of the application under test | `https://example.com` |
| `BROWSER`  | `chromium` \| `firefox` \| `webkit`    | `chromium`            |
| `HEADLESS` | `true` \| `false`                      | `true`                |
| `SLOWMO`   | Delay in ms between actions (debug)    | `0`                   |
| `TIMEOUT`  | Default action timeout in ms           | `30000`               |
| `VIDEO`    | `true` to record video for every test  | `false`               |
| `WORKERS`  | Number of parallel workers             | auto (or `2` on CI)   |

## Creating a test from scratch

Every test is made up of three files that mirror each other across `features/`, `steps/`, and `pages/`. Here is the full process using a hypothetical **Booking** page as an example.

### Step 1 — Create the Page Object

Create `pages/landing/BookingPage.ts` extending `BasePage`:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BookingPage extends BasePage {
  private readonly bookingForm: Locator;
  private readonly submitButton: Locator;
  private readonly confirmationMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Use IDs, roles, or attribute selectors — avoid fragile CSS paths
    this.bookingForm = page.locator('#booking-form');
    this.submitButton = page.locator('#submit-booking');
    this.confirmationMessage = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.goto('/#booking');
  }

  async submitBooking(name: string, email: string): Promise<void> {
    await this.fill(page.locator('#name'), name);
    await this.fill(page.locator('#email'), email);
    await this.click(this.submitButton);
  }

  async getConfirmationMessage(): Promise<string> {
    return this.getText(this.confirmationMessage);
  }
}
```

> `BasePage` already provides `click()`, `fill()`, `getText()` and `isVisible()` — use them instead of calling Playwright directly so waits are handled consistently.

### Step 2 — Write the feature file

Create `features/landing/booking.feature`. Use `Background` for shared preconditions and `Scenario Outline` + `Examples` when the same flow needs to run with multiple data sets:

```gherkin
Feature: Booking
  As a visitor
  I want to submit a booking request
  So that I can reserve a room

  Background:
    Given I am on the booking section

  @smoke
  Scenario: Successful booking submission
    When I submit a booking with name "John" and email "john@example.com"
    Then I should see the confirmation message "Booking Successful!"

  Scenario Outline: Booking validation
    When I submit a booking with name "<name>" and email "<email>"
    Then I should see the confirmation message "<message>"

    Examples:
      | name | email        | message                  |
      |      | a@example.com | Name is required         |
      | John |               | Email is required        |
```

### Step 3 — Write the step definitions

Create `steps/landing/booking.steps.ts`. Each step receives the `page` fixture from Playwright and translates Gherkin sentences into Page Object calls:

```typescript
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { BookingPage } from '../../pages/landing/BookingPage';

const { Given, When, Then } = createBdd();

Given('I am on the booking section', async ({ page }) => {
  const bookingPage = new BookingPage(page);
  await bookingPage.open();
});

When('I submit a booking with name {string} and email {string}', async ({ page }, name: string, email: string) => {
  const bookingPage = new BookingPage(page);
  await bookingPage.submitBooking(name, email);
});

Then('I should see the confirmation message {string}', async ({ page }, expected: string) => {
  const bookingPage = new BookingPage(page);
  expect(await bookingPage.getConfirmationMessage()).toBe(expected);
});
```

> Step text parameters map to TypeScript arguments in order. `{string}` matches a double-quoted value in the Gherkin sentence.

### Step 4 — Run the new test

```bash
npm test
# or target just the new feature
npx bddgen && npx playwright test --grep "Booking"
```

`bddgen` compiles your `.feature` + `.steps.ts` files into runnable specs under `.features-gen/` before Playwright executes them. `npm test` does this automatically via the `pretest` hook.

---

## Conventions

- **Page Objects** (`pages/`): encapsulate locators and interactions only — no assertions.
- **Steps** (`steps/`): translate Gherkin into Page Object calls and hold the `expect` assertions.
- **Features** (`features/`): written in plain Gherkin, readable by non-technical stakeholders.
- Folder structure mirrors across all three layers: `features/admin/login/` → `steps/admin/login/` → `pages/admin/`.
- Steps are shared across features automatically — if a step is already defined, reuse it rather than rewriting it.

## Workers / parallel execution

`playwright.config.ts` sets `fullyParallel: true`, so every scenario runs in its own isolated worker. Worker count:

- `WORKERS` env var if set (e.g. `WORKERS=4 npm test`)
- `2` when `CI=true` (set automatically by GitHub Actions)
- Playwright default (half the available CPU cores) otherwise

## Reports

Each `npm test` run generates two reports:

| Report | Path | Purpose |
| --- | --- | --- |
| Playwright HTML | `playwright-report/index.html` | Debug: traces, screenshots, timeline per step |
| Cucumber HTML | `cucumber-report/index.html` | Client-facing: scenarios in plain Gherkin, green/red per step |

```bash
npm run test:report   # open Playwright report
# open cucumber-report/index.html manually in your browser
```

Screenshots are captured for every scenario. Videos are captured on failure by default; set `VIDEO=true` to record all runs.

In CI (GitHub Actions), both reports are uploaded as artifacts after each run and kept for 30 days.

## Code quality and Git conventions

```bash
npm run lint          # run ESLint
npm run lint:fix      # run ESLint with auto-fix
npm run format        # run Prettier
npm run format:check  # check Prettier without writing
```

### Branch names

```
<type>/<kebab-case-description>
```

Valid types: `feat`, `fix`, `chore`. Examples: `feat/booking-tests`, `fix/login-selector`, `chore/update-deps`.

### Commit messages (Conventional Commits)

```
<type>(<optional scope>): <description>
```

Examples: `feat: add booking page tests`, `fix(login): update password selector`, `test: add smoke tag to dashboard`.

### Pre-commit hook

`lint-staged` runs `eslint --fix` and `prettier --write` on staged files before every commit.
