import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";
import { LinksFunction } from "@vercel/remix";
// Supports weights 100-900
import "@fontsource-variable/inter";

import styles from "@/index.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/png", href: "/icon.png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  // @ts-expect-error - `hydrate` is not a valid property on `handle`
  const includeScripts = matches.some((match) => match.handle?.hydrate);

  return (
    <html lang="en" className="font-inter">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="flex min-h-[100dvh] flex-col text-balance bg-gradient-to-br
          from-rose-500/15 via-sky-500/15 to-fuchsia-500/15
          dark:from-[#6366F1]/15 dark:to-[#EC4899]/15"
      >
        <section className="flex w-full flex-1 py-16 md:py-32">
          {children}
        </section>
        {includeScripts ? (
          <>
            <ScrollRestoration />
            <Scripts />
          </>
        ) : null}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
