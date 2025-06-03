# Starter Pack

This is a monorepo starter pack designed to kickstart your projects with a robust and scalable architecture. It leverages [Turborepo](https://turbo.build/repo) for efficient build times and [Shadcn UI](https://ui.shadcn.com/) for a beautiful and modern user interface.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Turborepo**: Monorepo management with fast incremental builds and intelligent caching.
- **Shadcn UI**: A collection of reusable components built with Radix UI and Tailwind CSS.
- **Biome**: An all-in-one toolchain for web projects, providing formatting and linting.
- **Husky**: Git hooks to ensure code quality before commits.
- **Commitlint**: Enforces conventional commit messages.
- **TypeScript**: Statically typed JavaScript for improved code quality and maintainability.
- **PNPM**: Fast, disk-space efficient package manager.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (>=18)
- [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/codersaadi/starter-pack.git
   cd starter-pack
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Project Structure

The monorepo is organized into the following main directories:

- `apps/`: Contains independent applications (e.g., `web`, `email`).
- `packages/`: Houses shared packages, such as UI components (`ui`), database utilities (`db`), and core functionalities (`core`), and i18n (`i18n`).
- `tooling/`: Custom tools or configurations for the monorepo.

## Available Scripts

In the root directory, you can run the following commands:

- `pnpm dev`: Starts the development servers for all applications.
- `pnpm build`: Builds all applications and packages.
- `pnpm lint`: Lints all applications and packages.
- `pnpm format`: Formats all code using Biome.
- `pnpm check`: Checks all code for linting and formatting issues using Biome.
- `pnpm format-and-lint`: Runs both formatting and linting checks.
- `pnpm format-and-lint:fix`: Fixes formatting and linting issues.
- `pnpm ui`: Runs the UI package related scripts.
- `pnpm web`: Runs the web application related scripts.
- `pnpm email`: Runs the email package related scripts.
- `pnpm db`: Runs the database package related scripts.
- `pnpm core`: Runs the core package related scripts.
- `pnpm prepare`: Prepares husky git hooks.
- `pnpm bump-deps`: Updates dependencies.
- `pnpm generate:i18n`: Generates i18n types.
- `pnpm translate:i18n`: Translates i18n content.
- `pnpm bump-ui`: Updates Shadcn UI components.

## Contributing

Contributions are welcome! Please ensure you follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for your commit messages.

## License

This project is licensed under the MIT License.
