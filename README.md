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

```bash
cp .env.example .env
```

`dotenv` only reads a file literally named `.env`, so `.env.example` **must be renamed/copied to `.env`** (dropping the `.example` suffix) — just having `.env.example` in the folder has no effect. On Windows without `cp`, rename the file manually or run `copy .env.example .env`.

`.env.example` already points `BASE_URL` at the live demo site (`https://automationintesting.online`), so once copied it works out of the box. No secrets are stored in it — only run configuration (see variables below).

## Running the tests

```bash
npm test                                    # generate specs from .feature files and run all tests
npm run test:headed -- --grep "scenario"    # run a single scenario with the browser visible
npm run test:ui                             # open Playwright UI mode to run tests interactively
npm run test:tags -- "@smoke"               # run only scenarios tagged @smoke
npm run test:report                         # open the last Playwright HTML report
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

## How playwright-bdd works

Unlike plain Cucumber.js, `playwright-bdd` doesn't execute Gherkin scenarios with its own test runner. `defineBddConfig()` (in `playwright.config.ts`) plus the `bddgen` CLI **compile every `.feature` file together with its matching `.steps.ts`** into a real Playwright test file under `.features-gen/` — one native `test()` per scenario, built on the standard Playwright `test` fixture. `npm test` runs `bddgen` first, then simply hands those generated specs to `playwright test`, exactly as if they had been written by hand.

Because each scenario ends up as a genuine Playwright test instead of living inside a separate Cucumber process, this project gets two capabilities "for free" that a plain Cucumber.js setup would not have:

- **Two reporters from a single run** — since Playwright's own test runner executes every scenario, its built-in `html` reporter works unmodified (trace/screenshot/video per test, see [Reports](#reports)). `playwright-bdd/reporter/cucumber` is just a second entry in the same `reporter: [...]` array in `playwright.config.ts`: it listens to those same results and re-renders them as a Gherkin-style Cucumber HTML report. Both are produced by one `npm test` — there's no need to run the suite twice or reconcile two separate result sets.
- **Playwright's native worker parallelism** — `fullyParallel` and `WORKERS` (see below) behave exactly as they would for hand-written specs, because each scenario is its own spec/test that Playwright's scheduler can freely distribute across workers. A traditional Cucumber runner drives scenarios through its own process/worker model, so that parallelism would have to be reimplemented through Cucumber's own mechanisms instead of Playwright's.

## Workers / parallel execution

`playwright.config.ts` sets `fullyParallel: true`, so every scenario runs in its own isolated worker. Worker count:

- `WORKERS` env var if set (e.g. `WORKERS=4 npm test`)
- `2` when `CI=true` (set automatically by GitHub Actions)
- Playwright default (half the available CPU cores) otherwise

## Reports

Each `npm test` run generates two reports — both made possible by the compilation step described in [How playwright-bdd works](#how-playwright-bdd-works):

### Playwright HTML report

Path: `playwright-report/index.html`

Technical, debug-oriented report. Lists every spec with its steps, and for each one gives access to the **trace** (full timeline with DOM snapshots, network, console and actions), screenshots and video. This is the report you reach for when a test fails and you need to see exactly what the browser did.

```bash
npm run test:report   # opens the last Playwright HTML report in your browser
```

From within that report, click the trace icon next to any test to open the trace viewer inline. You can also open a trace file directly, without going through the report:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

### Cucumber HTML report

Path: `cucumber-report/index.html`

Client-facing report: shows scenarios in plain Gherkin (`Given/When/Then`), with green/red per step. No trace/network detail — it's meant to be shared with non-technical stakeholders to confirm what was tested and what passed or failed.

```bash
# open cucumber-report/index.html manually in your browser
```

### Traces, screenshots and videos

- `trace: 'on'` — a trace is recorded for **every** test, pass or fail, so you can always inspect a run afterwards. Traces are saved under `test-results/<test-folder>/trace.zip` and are also reachable from the Playwright HTML report.
- Screenshots are captured for every scenario.
- Videos are captured on failure by default; set `VIDEO=true` to record all runs.

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

---

## Claude Code agents

This project ships three [Claude Code](https://claude.ai/code) subagents, defined in `.claude/agents/`, plus a shared skill (`.claude/skills/playwright-bdd/SKILL.md`) that documents the project's conventions, ISTQB-aligned test design techniques, SOLID applied to test code, and known anti-patterns — all three agents load it instead of duplicating that knowledge. Unlike slash commands, subagents aren't invoked with a `/command` — you ask Claude Code to use them by name (or Claude picks them up automatically when your request matches their description), and each one runs in its own isolated context with a restricted tool set (declared in its frontmatter).

| Agent | Responsibility | Never does |
|---|---|---|
| `qa` | Designs the `.feature` (Gherkin), one design technique per scenario | Write code, touch selectors, run tests |
| `qa-automation` | Implements / fixes / refactors Page Objects + steps | Redesign the `.feature`, `git commit` |
| `qa-explorer` | Explores the site with no pre-written script, reports findings | Write test code, confirm destructive actions without being asked |

### `qa` — Gherkin design (no code)

Designs a `.feature` file from a plain-language description, a Jira ticket, or an acceptance-criteria list. Writes only the `.feature` file — never step definitions, page objects, or TypeScript.

**What it does:**

1. Reads an existing `.feature` from the same area to match style, and greps `steps/**/*.steps.ts` to maximize step reuse.
2. Writes `features/<area>/<name>/<name>.feature` (or `features/<area>/<name>.feature` for simple flows).
3. Reports a step-reuse table and, if the input was a ticket, an AC-to-scenario traceability table.

**Example prompt:**

```
Use the qa agent to design a Gherkin feature for the room booking form on the landing page — happy path and validation errors.
```

---

### `qa-automation` — implementation, fix, and locator refactor

Implementation-only counterpart to `qa`. Operates in one of three modes depending on what you ask for:

| Mode | When | What it does |
|---|---|---|
| **create** (default) | A `.feature` exists and needs automation | Inspects the live page (`scripts/inspect-page.mjs`, falling back to the Playwright MCP tools), then writes the Page Object (`isLoaded()`/`open()` pattern, `robustLocator()`) and step definitions, and runs the suite to confirm green. |
| **fix** | A test is failing | Runs `npm test` if no error was given, diagnoses (broken locator / step mismatch / missing `await` / wrong assertion / bad fixture data), applies the minimal fix, and reruns. |
| **refactor** | Locators are fragile | Scans `pages/` for `this.page.locator(...)` not wrapped in `robustLocator()`, inspects the real page, and upgrades them — reverting anything that causes a regression. |

**Example prompts:**

```
Use the qa-automation agent to implement features/landingPage/roomBooking/roomBooking.feature.

Use the qa-automation agent (fix mode) to fix the failing test in steps/landingPage/roomBooking/roomBooking.steps.ts.

Use the qa-automation agent (refactor mode) on pages/landing/LandingPage.ts.
```

---

### `qa-explorer` — exploratory testing (SBTM), no script

Session-based exploratory testing against the live demo site, driven by a natural-language intent instead of a pre-written script. Drives the Playwright MCP tools already registered in `.mcp.json`. Read-only by default (navigation, tabs, toggles); never clicks a final "confirm/submit"-type action unless the intent explicitly asks for it, and never more than once per session. Every finding cites either a Nielsen heuristic or a reproducible, observable behavior (console error, failed request) — no impressionistic findings.

**What it does:**

1. Walks a set of routes/interactions sized by `depth` (`quick`/`standard`/`deep`), capturing accessibility snapshots, console errors, and network failures.
2. Checks `features/**/*.feature` before reporting a finding — if a scenario already covers it, it's not a new finding.
3. Writes `tmp/qa-explorer/<slug>/explore-results.json` (findings, severity, Nielsen citation, repro steps) and prints a summary.

**Example prompt:**

```
Use the qa-explorer agent to explore the booking flow for edge cases around date selection.
```

A finding that turns out to be a real bug or coverage gap gets handed to `qa` to become a proper traced Scenario — `qa-explorer` never writes `.feature` files or code itself.

---

All three agents share the project's real conventions (`BasePage.robustLocator()`, the `isLoaded()`/`open()` contract, `fixtures/testData.json`, locator priority `getByRole > getByLabel > getByPlaceholder > getByTestId > locator`, ISTQB test design techniques, SOLID applied to test code, anti-patterns) via the shared skill — see `.claude/skills/playwright-bdd/SKILL.md` for the full standard, and `.claude/agents/qa.md` / `qa-automation.md` / `qa-explorer.md` for each agent's specific contract.
