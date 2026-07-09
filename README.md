# Playwright Automation Framework

End-to-end automation framework using **Playwright** + **Cucumber (BDD)** + **Page Object Model**, written in TypeScript.

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
│   ├── dateUtils.ts
│   └── reportGenerator.js
├── fixtures/                 # Test data
│   └── testData.json
├── support/                  # Cucumber World and hooks (browser lifecycle)
│   └── testSetup.ts
├── reports/                  # Report output (generated, git-ignored)
├── cucumber.js               # Cucumber test runner configuration
├── playwright.config.ts      # Browser/context options read by support/testSetup.ts
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

Copy `.env.example` to `.env` and adjust the values for your environment.

## Running the tests

```bash
npm test                     # run all .feature files
npm run test:tags -- "@smoke"  # run only scenarios tagged @smoke
npm run test:report          # run the tests and generate the HTML report
```

Relevant environment variables (see `playwright.config.ts`):

| Variable   | Description                            | Default               |
| ---------- | -------------------------------------- | --------------------- |
| `BASE_URL` | Base URL of the application under test | `https://example.com` |
| `BROWSER`  | `chromium` \| `firefox` \| `webkit`    | `chromium`            |
| `HEADLESS` | `true` \| `false`                      | `true`                |
| `SLOWMO`   | Delay in ms between actions (debug)    | `0`                   |
| `TIMEOUT`  | Default timeout in ms                  | `30000`               |
| `VIDEO`    | Record a video of each scenario        | `false`               |

## Conventions

- **Page Objects** (`pages/`): encapsulate locators and page interactions; they don't contain business assertions.
- **Steps** (`steps/<module>/*.steps.ts`): translate Gherkin into Page Object calls and contain the assertions (`expect`).
- **World** (`support/testSetup.ts`): exposes `this.page` / `this.context` / `this.browser` to each step via `CustomWorld`.
- **Fixtures** (`fixtures/*.json`): test data (users, expected messages, etc.) imported by the steps.
- Each business module (login, dashboard, timesheet, ...) has a mirrored folder under `features/<module>/` and `steps/<module>/`.

## Reports

`npm run test:report` generates an enriched HTML report at `reports/html-report` using `multiple-cucumber-html-reporter`, in addition to Cucumber's raw JSON/HTML report in `reports/`.

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

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples: `feat/login-page`, `fix/navbar-overlap`, `test/dashboard-smoke`.

Validation runs in the `pre-commit` hook (`scripts/validate-branch-name.js`).

### Commit messages (Conventional Commits)

Commit messages are validated with **commitlint** (`commitlint.config.js`, `commit-msg` hook) following [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Valid examples: `feat: add login page`, `fix(dashboard): correct welcome banner selector`, `test: add smoke tag to login scenario`.

### Pre-commit

Before each commit, `lint-staged` runs `eslint --fix` and `prettier --write` only on the staged files (configured in `package.json`).
