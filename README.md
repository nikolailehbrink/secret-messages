# Secret Messages

This app allows users to send and receive encrypted messages securely. One-Time-Messages as well as expiring messages are supported.

<a href="https://www.secretmessag.es">
  <img alt="Secret Messages" src="https://www.secretmessag.es/og-image.jpg">
</a>

## ✨ Features

- **Modern Technologies**: Built with [Remix](https://remix.run), [Vite](https://vitejs.dev), and [Tailwind CSS](https://tailwindcss.com).
- **Database Integration**: Utilizes [Prisma](https://www.prisma.io/) for database management.
- **SEO**: Optimized for search engines and social sharing.
- **Accessibility**: Build on top of [Radix UI](https://radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/docs) and [v0.dev](https://v0.dev/r/Teb11BcSsgw) for accessible, modern and inclusive design.

## 🤗 Room for improvement

If you noticed a bug or something that could be improved, I welcome you to [file an issue](https://github.com/nikolailehbrink/secret-messages/issues/new) or [open a pull request](https://github.com/nikolailehbrink/secret-messages/compare) to contribute to the project.

## Development

Prerequisites:

- Docker (version 20.10.7 or higher)

First, install the dependencies:

```sh
npm install
```

Then, start the database:

```sh
npm run dev:db
```

Run the Vite dev server in a different terminal:

```sh
npm run dev
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
