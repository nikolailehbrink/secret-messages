# Secret Messages

This app allows users to send and receive encrypted messages securely. One-Time-Messages as well as expiring messages are supported.

<a href="https://www.secretmessag.es">
  <img alt="Secret Messages" src="https://www.secretmessag.es/og-image.jpg">
</a>

## ✨ Features

- **Modern Technologies**: Built with [Remix](https://remix.run), [Vite](https://vitejs.dev), and [Tailwind CSS](https://tailwindcss.com).
- **Database Integration**: Utilizes [Drizzle ORM](https://orm.drizzle.team/) with [Turso](https://turso.tech/) (SQLite) for database management.
- **SEO**: Optimized for search engines and social sharing.
- **Accessibility**: Build on top of [Radix UI](https://radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/docs) and [v0.dev](https://v0.dev/r/Teb11BcSsgw) for accessible, modern and inclusive design.

## 🤗 Room for improvement

If you noticed a bug or something that could be improved, I welcome you to [file an issue](https://github.com/nikolailehbrink/secret-messages/issues/new) or [open a pull request](https://github.com/nikolailehbrink/secret-messages/compare) to contribute to the project.

## Development

Install the dependencies:

```sh
npm install
```

Copy `.env.example` to `.env`. Locally the app runs against a plain SQLite file
(`TURSO_DATABASE_URL="file:./local.db"`), so no database server is needed.

Create the database schema:

```sh
npm run db:migrate
```

Run the Vite dev server:

```sh
npm run dev
```

### Database

| Script                | Purpose                                               |
| --------------------- | ----------------------------------------------------- |
| `npm run db:generate` | Generate a SQL migration from `app/.server/schema.ts` |
| `npm run db:migrate`  | Apply pending migrations                              |
| `npm run db:push`     | Push the schema without a migration file (local only) |
| `npm run db:seed`     | Insert demo data                                      |
| `npm run studio`      | Open Drizzle Studio                                   |

Production and preview deployments connect to Turso via `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN`, which are provided by the Turso integration on Vercel.

The resource is deliberately connected to the `production` and `preview`
environments only. That way `vercel env pull` does not write remote credentials
into `.env.local` – which Vite loads with a higher priority than `.env` – so
local development, including `/api/delete-messages`, can never operate on the
production database by accident.

To apply a migration to Turso, pass the credentials explicitly instead:

```sh
TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… npm run db:migrate
```

## Deployment

First, build your app for production:

```sh
npm run build
```

To preview the built app, run:

```sh
npm run preview
```

To run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to. Here are some popular hosting providers:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Heroku](https://www.heroku.com/)
- [DigitalOcean](https://www.digitalocean.com/)
- [AWS](https://aws.amazon.com/)
