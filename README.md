# Apex Kit(Advanced, SaasTurbokit)

<!-- [![Build Status](https://img.shields.io/github/actions/workflow/status/codersaadi/apex-kit/ci.yml?branch=main&style=for-the-badge)](https://github.com/codersaadi/apex-kit/actions) -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/codersaadi/apex-kit/pulls)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-F69220.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

**Apex Kit** is a production-ready, batteries-included monorepo starter kit for building modern, scalable, and type-safe SaaS applications. It's built on a foundation of Next.js 15, Drizzle ORM, and Tailwind CSS v4, and comes pre-configured with everything you need to launch your next big idea.

### ✨ [Live Demo](https://apexkit.vercel.app) (Optional: Link to your deployed starter)

---

## 🚀 Core Features

This starter kit is not just a template; it's a complete development ecosystem designed for performance, developer experience, and scalability.

-   **Modern Tech Stack:**
    -   ▲ **Next.js 15:** App Router, Server Actions, Edge & Node.js Runtimes, and Turbopack.
    -   💨 **Tailwind CSS v4:** A brand new engine for a smaller footprint and faster builds.
    -   🧩 **Shadcn UI:** A complete, beautifully designed, and accessible component library.
    -   💧 **Drizzle ORM:** Type-safe SQL with migrations, schema management, and Neon/Pglite support.
    -   🔄 **tRPC:** End-to-end typesafe APIs, with support for both Edge and Lambda functions.

-   **Enterprise-Grade Architecture:**
    -   📦 **Turborepo Monorepo:** Optimized for large-scale projects with fast, cached builds.
    -   🔐 **Flexible Authentication:**
        -   **Next-Auth v5:** Pre-configured with a wide range of OIDC providers (Auth0, Azure AD, GitHub, Authentik, Zitadel, and more).
        -   **Clerk:** Drop-in, ready-to-use authentication and user management.
        -   **Custom OIDC Provider:** Easily integrate your own OpenID Connect solution.
    -   💸 **Stripe Payments:** Subscription management, webhook handling, and customer portal integration.
    -   📧 **Pluggable Email Service:** Abstracted email sending with support for **AWS SES**, **Resend**, and any **SMTP** provider via Nodemailer.
    -   🌐 **Advanced Internationalization (i18n):**
        -   Full support for multiple languages, including **RTL (Right-to-Left)**.
        -   i18n for Markdown content using Content Collections.
        -   Includes scripts to **generate translations using AI** (via API).
    -   🗄️ **File Storage:** S3-compatible file uploads with pre-signed URLs for secure access.

-   **Unparalleled Developer Experience:**
    -   ⚡️ **Biome:** Blazing fast linter, formatter, and code analyzer, all in one tool.
    -   📚 **Storybook:** Isolated component development and documentation.
    -   📝 **Fumadocs:** Create beautiful, fast documentation sites from MDX.
    -   🤖 **Commitlint & Husky:** Enforced conventional commits and Git hooks for code quality.
    -   🔒 **End-to-End Type-Safety:** From the database to the frontend.
    -   🧪 **Scripts for Everything:** Database migrations, i18n generation, dependency updates, and more.

-   **Observability & Security:**
    -   🐛 **Sentry:** Production-grade error tracking and performance monitoring.
    -   🛡️ **Bot & Rate Limiting:** Integrated with Arcjet and Upstash Redis.
    -   📊 **Analytics Ready:** Plug-and-play support for Plausible, PostHog, Umami, Google Analytics, and more.
    -   🕸️ **Webhooks:** Built-in handling for Stripe, Clerk, and other services using Svix.
    -   ✅ **Zod Validations:** Robust data validation across the entire stack.

---

## 🏗️ What's Included?

This repository is a Turborepo monorepo.

### Apps

-   `web`: The main Next.js 15 application. Includes the marketing site, user dashboard, blog, and all user-facing pages.
-   `docs`: A documentation site built with [Fumadocs](https://fumadocs.ui.shadcn.com/), perfect for product guides and API references.
-   `storybook`: An isolated environment for developing and showcasing UI components from the `@repo/ui` package.
-   `email`: A visual preview environment for email templates using `react-email`.

### Packages (Shared Logic)

-   `@repo/core`: The heart of the application. Contains database schemas (Drizzle), tRPC routers, authentication logic, payment integrations, and core business logic.
-   `@repo/ui`: The shared UI library based on Shadcn UI, Tailwind CSS, and Radix UI primitives.
-   `@repo/i18n`: The internationalization powerhouse. Contains locale files, configuration, and scripts for AI-powered translation generation.
-   `@repo/env`: Centralized and validated environment variable management using `@t3-oss/env-nextjs`.
-   `@repo/email`: Defines email templates (using `react-email`) and the abstracted `sendEmail` function.
-   `@repo/db`: Contains Drizzle schema, migration scripts, and database utilities.
-   `@repo/notification`: Handles notifications logic, with a pre-configured setup for [Knock](https://knock.app).
-   `@repo/shared`: Shared constants, types, and utility functions used across the monorepo.
-   `@repo/webhooks`: Type-safe webhook handlers.
-   `@repo/locales`: Raw JSON locale files for different languages (`en-US`, `ar`, etc.).
-   `tooling/typescript-config`: Shared `tsconfig.json` configurations for the monorepo.

---

## 🏁 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher)
-   [pnpm](https://pnpm.io/installation) (v9 or higher)
-   [Docker](https://www.docker.com/products/docker-desktop/) (for running a local PostgreSQL database)

### 1. Clone the Repository

```bash
git clone https://github.com/codersaadi/apex-kit.git my-saas-app
cd my-saas-app
```

### 2. Set Up Environment Variables

This project uses a set of `.env` files for configuration. Copy the examples and fill in your credentials.

```bash
# Copy the main environment file for the web app and core services
cp .env.example .env

# Copy the email-specific environment file
cp packages/email/.env.example packages/email/.env
```

Now, open `.env` and `packages/email/.env` and provide the necessary values. **At a minimum, you'll need:**

1.  `DATABASE_URL`: Your PostgreSQL connection string.
2.  `NEXT_AUTH_SECRET`: A secret for Next-Auth. Run `openssl rand -base64 32` to generate one.
3.  Authentication Provider keys (e.g., `GITHUB_CLIENT_ID`, `CLERK_SECRET_KEY`, etc.).
4.  Email Provider credentials (e.g., `AWS_SES_REGION` and keys, or `RESEND_KEY`).

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Set Up the Database

Make sure your PostgreSQL server (e.g., via Docker) is running.

```bash
# Push the Drizzle schema to your database
pnpm db:push
```

For production, you'll use migrations:
```bash
# Generate a new migration after schema changes
pnpm --filter @repo/core db:generate

# Apply migrations
pnpm --filter @repo/core db:migrate
```

### 5. Run the Development Server

```bash
pnpm web dev
```

Your application will be available at `http://localhost:3000`.

---

## 🛠️ Available Scripts

This starter kit comes with a set of useful scripts defined in the root `package.json`.

| Script                 | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`             | Starts the development server for all apps (Next.js, Storybook, etc.).      |
| `pnpm build`           | Builds all apps for production.                                             |
| `pnpm lint`            | Lints the entire monorepo using Biome.                                      |
| `pnpm format`          | Formats all code in the monorepo using Biome.                               |
| `pnpm check`           | Checks and applies safe fixes across the monorepo with Biome.               |
| `pnpm ui`              | Runs Storybook for the `@repo/ui` package.                                  |
| `pnpm bump-ui`         | Updates Shadcn UI components to the latest version.                         |
| `pnpm generate:i18n`   | Generates TypeScript types from your i18n locale files.                     |
| `pnpm translate:i18n`  | (Advanced) Runs the script to automatically translate locales using an AI API. |
| `pnpm stripe:listen`   | Forwards Stripe webhooks to your local development server.                  |

---

## ⚙️ Configuration Deep Dive

### Authentication

You can easily switch between or combine `Clerk` and `Next-Auth`.

-   **To use Clerk:** Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in your `.env` file.
-   **To use Next-Auth:** Set `NEXT_PUBLIC_ENABLE_NEXT_AUTH="1"` and configure your desired OIDC providers (e.g., `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`).

### Email Provider

The email service is designed to be pluggable. Configure it in `packages/email/.env`:

-   Set `EMAIL_PROVIDER` to `"ses"`, `"resend"`, or `"nodemailer"`.
-   Fill in the corresponding credentials for the chosen provider.

For example, to use **AWS SES**:
```env
# packages/email/.env
EMAIL_PROVIDER="ses"
EMAIL_FROM="Your Name <noreply@yourverifieddomain.com>"
AWS_SES_REGION="us-east-1"
AWS_SES_ACCESS_KEY_ID="..."
AWS_SES_SECRET_ACCESS_KEY="..."
```

---

## 🚀 Deployment

The recommended hosting provider is **Vercel**, as it offers seamless integration with Next.js, including support for Edge Functions and caching.

1.  Push your repository to GitHub/GitLab.
2.  Import the project into Vercel.
3.  Vercel will automatically detect that it's a Turborepo monorepo. Set the root directory to `apps/web`.
4.  Add all the required environment variables from your `.env` file to the Vercel project settings.

And you're done! Vercel will handle the build and deployment process.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE.md) file for details.