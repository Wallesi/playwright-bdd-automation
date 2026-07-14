---
name: playwright-bdd
description: >
  Conventions, standards, and quality bar for this project's test automation stack —
  Playwright + playwright-bdd (Gherkin/Cucumber syntax) + Page Object Model, in TypeScript.
  Use whenever writing, reviewing, exploring, or fixing a `.feature` file, a step
  definition, or a Page Object in this repo — locator priority, the `isLoaded()`/`open()`
  contract, `robustLocator()`, test design technique, SOLID applied to test code,
  anti-patterns, and how to inspect the real page before writing a selector.
---

# Playwright + playwright-bdd — conventions, standards, and quality bar

Este skill es la fuente única de las convenciones técnicas **y** del nivel de rigor QA de
este repo. Los agentes `qa` (diseño), `qa-automation` (implementación) y `qa-explorer`
(exploratorio) lo cargan antes de trabajar — no dupliques este contenido dentro de ellos,
referencialo.

## Rol y contexto

Este repo es una pieza de portfolio: un framework de automatización E2E completo (Playwright
+ playwright-bdd + POM) sobre un sitio demo público (`automationintesting.online`, un hotel
booking demo pensado para practicar QA automation). El hecho de que el sitio bajo test sea
un demo **no baja el estándar de lo que se construye acá** — al contrario, la profundidad y
el rigor metodológico son parte de lo que este repo demuestra. Tratalo como si fuera un
engagement real de QA Automation Lead para un cliente, no como un tutorial.

## Standards y vocabulario (ISTQB-aligned)

Usalos como vocabulario y como checklist, no como burocracia — el objetivo es que cualquier
decisión de testing quede justificada en términos que un QA Lead reconocería.

### ISO/IEC/IEEE 29119-4 — técnicas de diseño de test

**Specification-based (caja negra):**
- **Equivalence Partitioning (EP)** — agrupar inputs en clases que deberían comportarse
  igual (ej. rangos de fechas válidas vs inválidas en el date picker de búsqueda).
- **Boundary Value Analysis (BVA)** — probar en y alrededor de los límites (ej. 1 noche vs 0
  noches de estadía, capacidad máxima de una habitación).
- **Decision tables** — reglas de negocio combinatorias (ej. tipo de habitación × cantidad
  de huéspedes × disponibilidad → precio mostrado).
- **State-transition testing** — ciclos de vida (ej. estado de una reserva: buscada →
  seleccionada → en checkout → confirmada).
- **Use-case testing** — flujos E2E trazados a un objetivo del actor (ej. "guest reserva una
  habitación y recibe confirmación").
- **Pairwise / combinatorial** — reducir espacios de parámetros explosivos cuando hay muchas
  variables independientes (tipo de habitación × fechas × huéspedes × método de pago).

**Experience-based:**
- **Exploratory testing (SBTM — session-based test management)** — sesiones charteadas,
  time-boxed, con hallazgos registrados. Es lo que hace el agente `qa-explorer`.
- **Error guessing** — anticipar fallas típicas de la clase de aplicación (booking engines:
  doble reserva, condiciones de carrera en disponibilidad, cálculo de precio con impuestos).

Cada `Scenario`/`Scenario Outline` que diseñe `qa` debería poder anotar mentalmente qué
técnica usó — no hace falta el comentario `# technique:` en el Gherkin salvo que el escenario
sea parte de una demostración explícita de rigor metodológico (documentarlo en el resumen de
la conversación alcanza).

### ISO/IEC 25010 — características de calidad como checklist de cobertura

No hace falta cubrir las 9 en cada feature, pero antes de dar por "completo" un vertical del
sitio, repasar cuáles aplican y cuáles se dejan fuera conscientemente (y por qué):

| Característica | Aplica en este repo como... |
|---|---|
| Functional suitability | Cobertura funcional E2E (el foco principal de este repo). |
| Interaction capability (usabilidad/accesibilidad) | Nielsen heuristics en exploratorio; WCAG fuera de scope automatizado por ahora (anotarlo, no fingir cobertura). |
| Reliability | Reintentos de red, estados de carga, mensajes de error — cubiertos en escenarios negativos. |
| Compatibility | Cross-browser vía `BROWSER` env var (`chromium`/`firefox`/`webkit`). |
| Performance efficiency, Security | Fuera de scope de este repo (no hay k6/ZAP acá) — anotarlo explícitamente, no improvisar. |

## Estructura de carpetas (se refleja entre las 3 capas)

```
features/<area>/<name>/<name>.feature   → Gherkin, agrupado por sección del sitio
steps/<area>/<name>/<name>.steps.ts     → step definitions, misma estructura que features/
pages/<area>/<Name>Page.ts              → Page Objects (POM)
fixtures/testData.json                  → datos de prueba
```

`features/admin/login/` → `steps/admin/login/` → `pages/admin/`. Los flujos simples de un
solo archivo (ej. `features/landingPage/ladingPage.feature`) no necesitan la subcarpeta
intermedia.

## Page Object Model

- Toda página **extiende `BasePage`** (`pages/BasePage.ts`), que ya provee `click()`,
  `fill()`, `getText()`, `isVisible()` — todos hacen `waitForVisible()` antes de actuar. Usar
  estos métodos en vez de llamar `page.locator(...).click()` directo.
- **`robustLocator(...locators)`**: encadena `.or()` sobre varios `Locator`. Prioridad
  Playwright, de más a menos resiliente:
  `getByRole` → `getByLabel` → `getByPlaceholder` → `getByTestId` → `locator('#id')` (CSS es
  el último recurso, no el primero).
  ```ts
  this.loginButton = this.robustLocator(
    this.page.getByRole('button', { name: 'Sign in' }),
    this.page.getByTestId('login-btn'),
    this.page.locator('#doLogin'),
  );
  ```
- **Patrón obligatorio `isLoaded()` + `open()`**: todo Page Object expone `isLoaded()`
  (espera el elemento más confiable de la página — heading principal, botón de submit, nav).
  Si la página tiene navegación propia, `open()` SIEMPRE llama `await this.isLoaded()`
  después de `goto()`. Si la página se alcanza por click (no por URL directa), igual expone
  `isLoaded()` para que el step lo llame después de navegar.
- **Sin assertions en Page Objects** — devuelven `Locator`/`Promise<string>`/`Promise<boolean>`.
  Los `expect(...)` viven en `steps/*.steps.ts`.
- Locators como `private readonly`, inicializados en el constructor — nunca inline dentro de
  un método.

## SOLID aplicado al código de test

El código de test es código — aplicá SOLID igual que en producción:

| Principio | Cómo aterriza en este repo |
|---|---|
| **S — Single Responsibility** | Un Page Object es dueño solo de los elementos/acciones de su página. Los steps orquestan Page Objects, no tocan el DOM directo. |
| **O — Open/Closed** | Agregar un método nuevo a un Page Object no debería requerir tocar los existentes; agregar un `robustLocator()` fallback nuevo no debería romper los otros. |
| **L — Liskov Substitution** | Todos los Page Objects extienden `BasePage` y son intercambiables donde se espera un `BasePage` — nunca overridear `click`/`fill` con una firma distinta. |
| **I — Interface Segregation** | Un Page Object no depende de utilidades que no usa (un `LoginPage` no necesita saber de `robustLocator` de booking). |
| **D — Dependency Inversion** | Los steps dependen de los métodos públicos del Page Object (la abstracción), nunca de `page.locator(...)` directo. |

### Qué NO va en un Page Object

| Concern | Dónde va en realidad |
|---|---|
| Assertions (`expect(...)`) | `steps/*.steps.ts` |
| Datos de prueba hardcodeados | `fixtures/testData.json` |
| Orquestación de navegación entre páginas | El step, no el Page Object |
| Lógica condicional de negocio | El step (el Page Object es "tonto": ejecuta, no decide) |

## Anti-patrones (nombralos si los ves)

- **Locator único sin fallback** (`page.locator('#id')` a secas) en vez de `robustLocator()`
  — se rompe con el primer refactor de CSS del sitio bajo test.
- **`waitForTimeout` para esperar estado** — usar `waitForVisible`/`waitForURL`/
  `waitForResponse` en su lugar; un timer fijo es un bug de diseño de test, no una espera.
  (`slowMo` vía `SLOWMO` env var es para debug visual, no para sincronizar el test.)
- **Assertions dentro del Page Object** — rompe la reutilización del Page Object en
  escenarios negativos (no podés reusar un método que ya asume que algo salió bien).
- **Steps que reimplementan un step ya existente** con texto casi idéntico — duplica
  mantenimiento y fragmenta el step-reuse que `playwright-bdd` da gratis.
- **Reusar un step genérico para un componente específico** (`Then I should see {string}`
  para verificar un componente puntual como una card o un modal) — produce falsos positivos
  porque el texto podría estar en cualquier parte de la página, no en el componente que
  realmente se quiere validar.
- **Tests interdependientes** (Scenario B asume que Scenario A ya corrió y dejó estado) —
  cada Scenario tiene que poder correr solo, en cualquier orden.
- **Ignorar un flake como "cosas que pasan"** — un test no determinista es una señal real
  (timing, estado compartido en el sitio demo, condición de carrera), no ruido a ignorar.
- **"Cobertura 100%" como métrica en sí misma** — priorizar por riesgo (money/booking
  integrity, flujos críticos) antes que perseguir un número.

## Tooling de este repo (y por qué)

| Concern | Elegido | Por qué |
|---|---|---|
| Browser automation | Playwright | Auto-wait, multi-browser, tracing/video nativos. |
| BDD | `playwright-bdd` | Un solo test runner (Playwright) en vez de dos (Cucumber + Playwright) — ver "Cómo funciona playwright-bdd" en el README. |
| Reporting | HTML de Playwright + `playwright-bdd/reporter/cucumber` | Un reporte técnico (trace/video) + uno legible en Gherkin, de una sola corrida. |
| Lint/format | ESLint + Prettier + husky/lint-staged | Gate de pre-commit, ya configurado. |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Lint job + test job con artifacts de ambos reportes. |

**Fuera de scope deliberado** (no lo agregues sin que te lo pidan): performance testing
(k6), escaneo de seguridad automatizado (ZAP/axe-core), contract testing (Pact). Si una
tarea lo requiere, anotalo como "no cubierto por este framework" en vez of improvisarlo.

## Steps (`playwright-bdd`)

- `const { Given, When, Then } = createBdd();` — nunca imports de `@cucumber/cucumber`
  directo (este proyecto usa `playwright-bdd`, no Cucumber puro).
- Cada step instancia el Page Object dentro del propio step (`new LoginPage(page)`), nunca
  fuera.
- **Los steps se comparten automáticamente entre features por el texto literal** — si un step
  ya existe y es semánticamente equivalente, reusarlo en vez de reescribirlo.

## Test data

`fixtures/testData.json` — nunca hardcodear un valor (usuario, mensaje esperado, datos de
formulario) que ya está ahí.

## Inspección de la página real — `scripts/inspect-page.mjs`

**Primario (barato en tokens):**
```bash
node scripts/inspect-page.mjs https://automationintesting.online/<path>
node scripts/inspect-page.mjs https://automationintesting.online/<path> --click=<texto> --capture=<selector CSS>
```
Devuelve, por cada elemento interactivo, un array `locators` ya ordenado por la prioridad de
arriba — usar directamente esas opciones al armar un `robustLocator()`.

**Fallback (solo si el script falla o vuelve vacío):** Playwright MCP con un único
`browser_navigate` + `browser_snapshot`. Sin screenshots — cuesta más tokens, usar solo
cuando el script no alcanza.

## Correr los tests

```bash
npm test                                    # bddgen + toda la suite
npx bddgen && npx playwright test --grep "<Feature o Scenario>"   # acotado
npm run test:tags -- "@smoke"               # por tag
npm run test:report                         # último reporte HTML
```

No declarar un test "pasando" sin haberlo corrido. Si un fix tocó un locator, correrlo al
menos 2 veces consecutivas antes de confirmar éxito (descartar flake).

## Métricas de calidad (para reportar, no para perseguir en el vacío)

- **Flakiness rate** — % de corridas no determinísticas sobre corridas totales de un test;
  objetivo < 1% en `@smoke`.
- **Defect escape equivalent** — bugs reales del sitio demo encontrados por `qa-explorer`
  que NO tenían un Scenario que los cubriera (indica gap de diseño, no de ejecución).
  Cerrar el loop: cada finding de `qa-explorer` que se confirma real debería convertirse en
  un Scenario nuevo diseñado por `qa`.
- **Risk coverage** — % de flujos críticos (booking end-to-end, cálculo de precio, contact
  form) con al menos un escenario `@smoke`.

## Composición — los 3 agentes de este repo

| Agente | Responsabilidad | Nunca hace |
|---|---|---|
| `qa` | Diseña el `.feature` (Gherkin) | Código, selectors, correr tests |
| `qa-automation` | Implementa/arregla/refactoriza Page Objects + steps | Rediseñar el `.feature`, `git commit` |
| `qa-explorer` | Explora el sitio sin script previo, reporta hallazgos | Escribir código de test, confirmar acciones destructivas sin avisar |

Un finding de `qa-explorer` que se confirma como bug o gap de cobertura real se pasa a `qa`
para que lo convierta en Scenario — no lo automatiza `qa-explorer` directamente.
