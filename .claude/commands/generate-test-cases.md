Generate Gherkin test cases based on the following input:

$ARGUMENTS

## Instructions

### Step 1 — Identify the input type

The input above can be either:

- **A Jira ticket** — contains fields like Summary, Description, Acceptance Criteria, User Story, or similar structured content
- **A natural language description** — a plain sentence or paragraph describing what to test

---

### Step 2A — If the input is a Jira ticket

Extract the following from the ticket:

- **User story**: the "As a / I want / So that" if present, or derive it from the Summary + Description
- **Acceptance criteria**: each AC item becomes one or more Gherkin scenarios
- **Edge cases and negative flows**: any "must not", "should not", "error", "invalid", "empty" mentions in the description become negative scenarios
- **Business rules**: constraints, limits, or conditions mentioned anywhere in the ticket

Map each acceptance criterion to at least one scenario. Do not skip ACs.

---

### Step 2B — If the input is a natural language description

Derive the user story and identify:

- The happy path (main success flow)
- Likely edge cases (empty inputs, invalid data, unauthorized access, boundary values)
- Any negative flows implied by the feature

---

### Step 3 — Generate the Gherkin

Read the existing feature files to match the project's style:

- `features/admin/login/login.feature`
- `features/admin/dashboard/dashboard.feature`
- `features/landingPage/ladingPage.feature`

Then generate the `.feature` file content following these rules:

**Structure:**

- `Feature:` with 3-line user story (`As a` / `I want` / `So that`)
- `Background:` for shared preconditions (e.g. navigation, login)
- `@smoke` tag on the main happy path scenario
- `@regression` tag on negative and edge case scenarios
- Use `{string}` / `{int}` for parameterized values
- Use `Scenario Outline:` + `Examples:` when the same flow repeats with different data

**Coverage — generate scenarios for:**

1. Happy path (one per main AC)
2. Negative/error flows (invalid input, unauthorized, not found)
3. Edge cases (empty fields, boundary values, special characters if relevant)

**Step writing rules:**

- `Given` → preconditions / navigation
- `When` → user actions
- `Then` → assertions / expected results
- Steps must be reusable across scenarios — no hardcoded values in the step text

---

### Step 4 — Output

1. The complete `.feature` file content
2. Suggested file path: `features/<area>/<feature-name>/<name>.feature`
3. A short traceability table mapping each AC (or requirement) to its scenario(s):

| Acceptance Criterion                        | Scenario(s)                                |
| ------------------------------------------- | ------------------------------------------ |
| AC1: user can log in with valid credentials | Scenario: Successful login                 |
| AC2: error shown for invalid password       | Scenario: Failed login with wrong password |

Do NOT create any files — output only. The user will review before running `/create-test`.
