# Playwright Automation Framework

Framework de automatización E2E usando **Playwright** + **Cucumber (BDD)** + **Page Object Model**, escrito en TypeScript.

## Estructura de carpetas

```
├── features/                # Especificaciones Gherkin, agrupadas por módulo
│   ├── login/
│   │   └── login.feature
│   ├── dashboard/
│   │   └── dashboard.feature
│   └── timesheet/
├── steps/                   # Step definitions, agrupadas por módulo
│   ├── login/
│   │   └── login.steps.ts
│   └── dashboard/
│       └── dashboard.steps.ts
├── pages/                  # Page Objects (POM)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── utils/                  # Helpers reutilizables
│   ├── commonUtils.ts
│   ├── dateUtils.ts
│   └── reportGenerator.js
├── fixtures/                 # Datos de prueba
│   └── testData.json
├── support/                  # World y hooks de Cucumber (ciclo de vida del browser)
│   └── testSetup.ts
├── reports/                  # Salida de reportes (generado, ignorado por git)
├── cucumber.js               # Configuración del test runner de Cucumber
├── playwright.config.ts      # Opciones de browser/context leídas por support/testSetup.ts
└── tsconfig.json
```

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
npx playwright install
```

Copiar `.env.example` a `.env` y ajustar los valores según el entorno.

## Ejecutar los tests

```bash
npm test                     # corre todos los .feature
npm run test:tags -- "@smoke"  # corre solo escenarios con el tag @smoke
npm run test:report          # corre los tests y genera el reporte HTML
```

Variables de entorno relevantes (ver `playwright.config.ts`):

| Variable   | Descripción                           | Default               |
| ---------- | ------------------------------------- | --------------------- |
| `BASE_URL` | URL base de la aplicación bajo prueba | `https://example.com` |
| `BROWSER`  | `chromium` \| `firefox` \| `webkit`   | `chromium`            |
| `HEADLESS` | `true` \| `false`                     | `true`                |
| `SLOWMO`   | Delay en ms entre acciones (debug)    | `0`                   |
| `TIMEOUT`  | Timeout por defecto en ms             | `30000`               |
| `VIDEO`    | Graba video de cada escenario         | `false`               |

## Convenciones

- **Page Objects** (`pages/`): encapsulan locators e interacciones de una página; no contienen aserciones de negocio.
- **Steps** (`steps/<modulo>/*.steps.ts`): traducen Gherkin a llamadas a Page Objects y contienen las aserciones (`expect`).
- **World** (`support/testSetup.ts`): expone `this.page` / `this.context` / `this.browser` a cada step vía `CustomWorld`.
- **Fixtures** (`fixtures/*.json`): datos de prueba (usuarios, mensajes esperados, etc.) importados por los steps.
- Cada módulo de negocio (login, dashboard, timesheet, ...) tiene su carpeta espejada en `features/<modulo>/` y `steps/<modulo>/`.

## Reportes

`npm run test:report` genera un reporte HTML enriquecido en `reports/html-report` usando `multiple-cucumber-html-reporter`, además del reporte JSON/HTML crudo de Cucumber en `reports/`.
