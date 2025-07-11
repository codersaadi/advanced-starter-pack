# Private Starter Kit

This is a comprehensive, production-ready monorepo starter kit designed for building modern, full-stack applications. It comes pre-configured with a suite of powerful tools and a logical structure to accelerate development.

## Table of Contents

- [Features](#features)
- [Monorepo Structure](#monorepo-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Monorepo:** Managed with `pnpm` and `Turborepo` for efficient builds and dependency management.
- **Full-stack Framework:** Built on [Next.js](https://nextjs.org/) for both the main web application and the documentation site.
- **UI Components:** A dedicated UI package (`@repo/ui`) using [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/), with component previews in [Storybook](https://storybook.js.org/).
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access.
- **API Layer:** [tRPC](https://trpc.io/) for building type-safe APIs between the client and server.
- **Authentication:** [Clerk](https://clerk.com/) for secure and easy-to-use authentication.
- **Internationalization (i18n):** Fully configured i18n setup for multi-language support.
- **Email Handling:** Integrated email templating and sending capabilities.
- **Code Quality:** Enforced code style and quality with [BiomeJS](https://biomejs.dev/), [ESLint](https://eslint.org/), and [TypeScript](https://www.typescriptlang.org/).
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) for running checks before commits.
- **Conventional Commits:** Enforced commit message format with [Commitlint](https://commitlint.js.org/).
- **Environment Variables:** Centralized and type-safe environment variable management with Zod.

## Monorepo Structure

The repository is organized into two main directories: `apps` and `packages`.

-   `apps/`: Contains the different applications.
    -   `web`: The main Next.js web application.
    -   `docs`: A Next.js and MDX-based documentation site.
    -   `email`: Email templates and previews.
    -   `storybook`: An isolated environment for developing and showcasing UI components.
-   `packages/`: Contains shared code and libraries.
    -   `core`: Core business logic, server setup, and database interactions.
    -   `ui`: Shared React components for the UI.
    -   `i18n`: Internationalization configuration and scripts.
    -   `locales`: Translation files for different languages.
    -   `env`: Zod-based environment variable validation.
    -   `notification`: Handles notifications logic.
    -   `shared`: Shared utilities, constants, and types.
    -   `webhooks`: For handling incoming webhooks.
-   `tooling/`: Contains shared configurations for tools.
    -   `typescript-config`: Shared `tsconfig.json` files.
    -   `workflow-config`: Configuration for workflows and scripts.

## Technologies Used

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Monorepo:** [pnpm](https://pnpm.io/), [Turborepo](https://turbo.build/)
-   **UI:** [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Storybook](https://storybook.js.org/)
-   **Database:** [Drizzle ORM](https://orm.drizzle.team/), [PostgreSQL](https://www.postgresql.org/)
-   **API:** [tRPC](https://trpc.io/)
-   **Authentication:** [Clerk](https://clerk.com/)
-   **Code Quality:** [BiomeJS](https://biomejs.dev/), [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/)
-   **Testing:** [Jest](https://jestjs.io/)
-   **i18n:** [next-i18next](https://github.com/i18next/next-i18next)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (version >= 18)
-   [pnpm](https://pnpm.io/) (version >= 9)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
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
pnpm dev
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
-   `translate:i18n`: Runs the translation script for the i18n module.
-   `bump-ui`: Adds all available `shadcn/ui` components to the `@repo/ui` package.

## Contributing

Contributions are welcome. Please ensure that your code adheres to the established linting and formatting rules. Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Disclaimer

This repo is subject to change , may have many changes and updates in the near future

## License

This starter kit is licensed under the [MIT License](LICENSE).