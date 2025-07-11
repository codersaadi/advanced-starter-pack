# Advanced Starter Pack

This is a comprehensive, production-ready monorepo starter kit designed for building modern, full-stack applications. It comes pre-configured with a suite of powerful tools and a logical structure to accelerate development.

## Table of Contents

- [Features](#features)
- [Monorepo Structure](#monorepo-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Authentication](#authentication)
- [Email Handling](#email-handling)
- [Internationalization (i18n)](#internationalization-i18n)
- [UI and State Management](#ui-and-state-management)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Monorepo:** Managed with `pnpm` and `Turborepo` for efficient builds and dependency management.
- **Full-stack Framework:** Built on [Next.js](https://nextjs.org/) for both the main web application and the documentation site.
- **Dual Authentication Strategy:** Pre-configured support for both [Clerk](https://clerk.com/) and [Next-Auth](https://next-auth.js.org/), allowing you to choose the best fit for your needs.
- **Custom OIDC Provider:** Includes a custom OIDC provider implementation, giving you full control over your authentication flows.
- **UI Components:** A dedicated UI package (`@repo/ui`) using [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), and [Tanstack Table](https://tanstack.com/table/v8) for building beautiful and complex data grids.
- **Component Previews:** Isolated component development and previews with [Storybook](https://storybook.js.org/).
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access with PostgreSQL.
- **API Layer:** [tRPC](https://trpc.io/) for building type-safe APIs between the client and server.
- **File Storage:** Integrated with both **S3** and **R2** for flexible file storage options.
- **Payments:** Pre-configured **Stripe** integration for handling payments.
- **Advanced Email System:** A robust, multi-provider email system supporting **Resend**, **Nodemailer (SMTP)**, and **AWS SES**, configurable via environment variables.
- **AI-Powered Internationalization (i18n):** A comprehensive i18n setup using `i18next`, featuring an advanced script that leverages the **Google Gemini API** to automatically translate language files.
- **Code Quality:** Enforced code style and quality with [BiomeJS](https://biomejs.dev/), [ESLint](https://eslint.org/), and [TypeScript](https://www.typescriptlang.org/).
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) for running checks before commits.
- **Conventional Commits:** Enforced commit message format with [Commitlint](https://commitlint.js.org/).
- **Environment Variables:** Centralized and type-safe environment variable management with Zod.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) for lightweight global state management and [SWR](https://swr.vercel.app/) for data fetching and caching.

## Monorepo Structure

The repository is organized into two main directories: `apps` and `packages`.

-   `apps/`: Contains the different applications.
-   `packages/`: Contains shared code and libraries, including `core`, `ui`, `i18n`, and `email`.
-   `tooling/`: Contains shared configurations for tools.

## Technologies Used

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Monorepo:** [pnpm](https://pnpm.io/), [Turborepo](https://turbo.build/)
-   **UI:** [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Storybook](https://storybook.js.org/), [Tanstack Table](https://tanstack.com/table/v8)
-   **Database:** [Drizzle ORM](https://orm.drizzle.team/), [PostgreSQL](https://www.postgresql.org/)
-   **API:** [tRPC](https://trpc.io/)
-   **Authentication:** [Clerk](https://clerk.com/), [Next-Auth](https://next-auth.js.org/), [OIDC Provider](https://github.com/panva/node-oidc-provider)
-   **Email:** [Resend](https://resend.com/), [Nodemailer](https://nodemailer.com/), [AWS SES](https://aws.amazon.com/ses/)
-   **Internationalization:** [i18next](https://www.i18next.com/), [Google Gemini API](https://ai.google.dev/)
-   **State Management:** [Zustand](https://github.com/pmndrs/zustand), [SWR](https://swr.vercel.app/)
-   **Code Quality:** [BiomeJS](https://biomejs.dev/), [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/)
-   **Testing:** [Jest](https://jestjs.io/)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (version >= 18)
-   [pnpm](https://pnpm.io/) (version >= 9)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/codersaadi/advanced-starter-pack.git
    cd private-starterkit
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Each app and package with an `.env.example` file needs its own `.env` file. Start by copying the example file in the `web` app:

    ```bash
    cp apps/web/.env.example apps/web/.env
    ```

    Then, fill in the required environment variables in `apps/web/.env`.

### Running in Development Mode

To start all applications in development mode, run the following command from the root of the project:

```bash
pnpm web dev
```

This will use Turborepo to run the `dev` script for each app in the monorepo.

## Available Scripts

The following scripts are available at the root level and can be run with `pnpm <script-name>`:

-   `dev`: Starts all applications in development mode.
-   `build`: Builds all applications for production.
-   `lint`: Lints the codebase using Turborepo.
-   `check`: Runs BiomeJS to check for formatting and linting issues.
-   `format-and-lint:fix`: Applies automatic fixes for formatting and linting issues found by BiomeJS.
-   `test`: Runs Jest tests.
-   `generate:i18n`: Generates types for the i18n module.
-   `translate:i18n`: Runs the AI-powered translation script for the i18n module.
-   `bump-ui`: Adds all available `shadcn/ui` components to the `@repo/ui` package.

## Authentication

This starter kit provides a flexible authentication setup that can be configured to use either **Clerk** or **Next-Auth**.

-   **Clerk:** For a quick and easy, yet powerful, authentication solution with pre-built UI components.
-   **Next-Auth:** For a more customizable solution, this starter kit includes a full implementation of a custom **OIDC Provider**, giving you the ability to act as your own identity provider.

The choice between them can be configured via environment variables.

## Email Handling

This project includes a flexible email service that can be configured to use one of several providers:

-   **Resend:** A modern email platform for developers.
-   **Nodemailer:** A module for Node.js applications to allow easy as cake email sending. Can be configured with any SMTP provider.
-   **AWS SES:** Amazon's Simple Email Service for a scalable and cost-effective solution.

The active provider is determined by the `EMAIL_PROVIDER` environment variable.

## Internationalization (i18n)

The i18n system is built with `i18next` and is designed for scalability. A key feature is the automated translation script located in `@repo/i18n/scripts/translate.ts`. This script uses the **Google Gemini API** to translate the source language files (in English) into all other supported languages, drastically reducing the manual effort required for localization.

## UI and State Management

-   **shadcn/ui:** A collection of beautifully designed, accessible, and customizable components.
-   **Tanstack Table:** A headless utility for building powerful and flexible data tables and datagrids.
-   **Zustand:** A small, fast, and scalable state-management solution.
-   **SWR:** A React Hooks library for data fetching, providing caching, revalidation, and more.

## Contributing

Contributions are welcome. Please ensure that your code adheres to the established linting and formatting rules. Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Disclaimer

This repo is subject to change , may have many changes and updates in the near future

## License

This starter kit is licensed under the [MIT License](LICENSE).
