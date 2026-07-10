# Playwright Automation Framework

End-to-end automation framework using **Playwright** + **playwright-bdd (Gherkin/Cucumber syntax)** + **Page Object Model**, written in TypeScript.

## Folder structure

```
├── features/                # Gherkin specs, grouped by module
│   ├── login/
│   │   └── login.feature
│   ├── dashboard/
│   │   └── dashboard.feature
│   └── timesheet/
├── steps/                   # Step definitions, grouped by module
│   ├── login/
│   │   └── login.steps.ts
│   └── dashboard/
│       └── dashboard.steps.ts
├── pages/                  # Page Objects (POM)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── utils/                  # Reusable helpers
│   ├── commonUtils.ts
│   └── dateUtils.ts
├── fixtures/                 # Test data
│   └── testData.json
├── .features-gen/             # Playwright specs generated from .feature files (git-ignored)
├── playwright-report/         # Playwright HTML report (generated, git-ignored)
├── test-results/              # Traces/screenshots/videos per test (generated, git-ignored)
├── playwright.config.ts      # Playwright config: BDD generation, browser/context options, workers, reporter
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

Environment config lives directly in the versioned [`.env`](.env) file at the project root — adjust the values there for your environment (no secrets are stored in it, only run configuration).

## Running the tests

```bash
npm test                       # generate specs from .feature files and run them
npm run test:tags -- "@smoke"  # run only scenarios tagged @smoke
npm run test:report            # open the last generated HTML report
```

Tests run in parallel across multiple workers by default (see [Workers / parallel execution](#workers--parallel-execution)). You can also call Playwright's CLI directly for more control, e.g. `npx playwright test --project=chromium` or `npx playwright test --grep "@smoke"`.

Relevant environment variables (see `playwright.config.ts`):

| Variable   | Description                            | Default               |
| ---------- | -------------------------------------- | --------------------- |
| `BASE_URL` | Base URL of the application under test | `https://example.com` |
| `BROWSER`  | `chromium` \| `firefox` \| `webkit`    | `chromium`            |
| `HEADLESS` | `true` \| `false`                      | `true`                |
| `SLOWMO`   | Delay in ms between actions (debug)    | `0`                   |
| `TIMEOUT`  | Default action timeout in ms           | `30000`               |
| `VIDEO`    | Record a video of each scenario        | `false`               |
| `WORKERS`  | Number of parallel workers (see below) | auto (or `2` on CI)   |

## Conventions

- **Page Objects** (`pages/`): encapsulate locators and page interactions; they don't contain business assertions.
- **Steps** (`steps/<module>/*.steps.ts`): translate Gherkin into Page Object calls and contain the assertions (`expect`), defined with `createBdd()` from `playwright-bdd`. Each step receives Playwright's own fixtures (`{ page }`, `{ context }`, ...) instead of a Cucumber `World`.
- **Fixtures** (`fixtures/*.json`): test data (users, expected messages, etc.) imported by the steps.
- Each business module (login, dashboard, timesheet, ...) has a mirrored folder under `features/<module>/` and `steps/<module>/`.
- `npm test` runs `bddgen`, which compiles `features/**/*.feature` + `steps/**/*.steps.ts` into runnable specs under `.features-gen/` (git-ignored); Playwright then executes those specs directly.

## Workers / parallel execution

`playwright.config.ts` sets `fullyParallel: true`, so every scenario runs in its own isolated worker process. The worker count is:

- the `WORKERS` env var if set (e.g. `WORKERS=4 npm test`),
- otherwise `2` when `CI` is set,
- otherwise Playwright's default (based on available CPU cores).

You can also override it ad hoc: `npx playwright test --workers=4`.

## Reports

Playwright's built-in HTML reporter is used (`playwright.config.ts` → `reporter: [['html', ...], ['list']]`). After a run, open the report with:

```bash
npm run test:report
```

Failure screenshots, traces (`retain-on-failure`) and videos (if `VIDEO=true`) are attached automatically to each failed test in the report.

## Code quality and Git conventions

The project uses **ESLint** + **Prettier** for the code and **Husky** to enforce Git conventions via git hooks.

```bash
npm run lint          # eslint
npm run lint:fix       # eslint --fix
npm run format          # prettier --write
npm run format:check     # prettier --check
```

### Branch names

Every commit (except on `main`, `master`, `develop`, `dev`, `staging`) must be made from a branch following this pattern:

```
<type>/<kebab-case-description>
```

Valid types: `feat`, `fix`, `chore`.

Examples: `feat/login-page`, `fix/navbar-overlap`, `chore/update-dependencies`.

Validation runs in the `pre-commit` hook (`scripts/validate-branch-name.js`).

### Commit messages (Conventional Commits)

Commit messages are validated with **commitlint** (config in the `commitlint` field of `package.json`, `commit-msg` hook) following [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Valid examples: `feat: add login page`, `fix(dashboard): correct welcome banner selector`, `test: add smoke tag to login scenario`.

### Pre-commit

Before each commit, `lint-staged` runs `eslint --fix` and `prettier --write` only on the staged files (configured in `package.json`).
