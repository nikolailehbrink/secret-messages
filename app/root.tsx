import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  href,
  isRouteErrorResponse,
  useLocation,
  type LinksFunction,
} from "react-router";
import { Analytics } from "@vercel/analytics/react";
// Supports weights 100-900
import "@fontsource-variable/inter";
import interWoff2 from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

import Footer from "./components/Footer";
import GradientHeading from "./components/GradientHeading";
import { Button } from "./components/ui/button";

import "./app.css";
import type { Route } from "./+types/root";
import {
  ChatCircleDotsIcon,
  EnvelopeSimpleOpenIcon,
} from "@phosphor-icons/react";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    as: "font",
    href: interWoff2,
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "icon", type: "image/png", href: "/icon.png" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { origin } = new URL(request.url);
  return { origin };
}

export const meta: Route.MetaFunction = ({ error, data }) => {
  if (!data) {
    throw new Error("No loader data.");
  }
  const { origin } = data;
  const ogImagePath = `${origin}/og-image.jpg`;
  const title = error
    ? isRouteErrorResponse(error) && error.status === 404
      ? error.statusText
      : `An error occured`
    : "Share confidential messages";

  return [
    {
      title: title + " - secretmessag.es",
    },
    { property: "og:title", content: title },
    {
      property: "og:image",
      content: ogImagePath,
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: origin },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:image", content: ogImagePath },
    // TODO: Inform about canonical URL
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="font-inter scrollbar-thin scrollbar-track-white
        scrollbar-thumb-neutral-400"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="flex min-h-[100dvh] flex-col bg-linear-to-br from-rose-500/15
          via-sky-500/15 to-fuchsia-500/15 text-balance"
      >
        <section className="flex w-full flex-1 pt-16 pb-4 sm:pt-12 md:pt-24">
        <div
          className="paper mask-from-80% absolute size-full mask-b-from-75%
            mask-radial-from-50% mask-radial-to-85%"
        ></div>
          {children}
        </section>
        <ScrollRestoration />
        <Scripts />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error, loaderData }: Route.ErrorBoundaryProps) {
  if (!loaderData) {
    throw new Error("No loader data provided for error boundary");
  }
  const { origin } = loaderData;
  const { pathname } = useLocation();
  const pageUrl = `${origin}${pathname}`;
  const notFound = isRouteErrorResponse(error) && error;
  return (
    <div
      className="container flex flex-col items-center justify-center gap-2
        text-center"
    >
      <GradientHeading level="1" className="text-4xl/snug">
        {notFound ? notFound.statusText : "Oops! An error occurred"}
      </GradientHeading>
      <p className="max-w-prose text-muted-foreground">
        {notFound
          ? notFound.data
          : "Please attempt your request again later. Should the issue persist, kindly report it to assist in resolving the matter promptly. Thank you for your cooperation."}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link to={href("/")} prefetch="viewport">
            <ChatCircleDotsIcon size={20} weight="duotone" />
            Create a secret message
          </Link>
        </Button>
        <Button asChild>
          <a
            href={`mailto:mail@nikolailehbr.ink?subject=Error on ${pageUrl}&body=Hello, I encountered an error on ${pageUrl} and I would like to report it. Here is what I did that caused the error:`}
          >
            <EnvelopeSimpleOpenIcon size={20} weight="duotone" />
            Report an Issue
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  return <Outlet />;
}
