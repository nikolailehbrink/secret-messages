import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
// Supports weights 100-900
import "@fontsource-variable/inter";

import styles from "@/index.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-inter">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
      <body
        className="flex min-h-[100dvh] flex-col text-balance bg-gradient-to-br
          from-rose-500/10 via-sky-500/5 to-fuchsia-500/10
          dark:from-[#6366F1]/10 dark:to-[#EC4899]/10"
      >
        <section className="flex w-full flex-1 py-16 md:py-32 lg:py-40">
          {children}
        </section>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
