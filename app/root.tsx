import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { LinksFunction, MetaFunction } from "@vercel/remix";
// Supports weights 100-900
import "@fontsource-variable/inter";
import { EnvelopeSimpleOpen } from "@phosphor-icons/react/dist/ssr/EnvelopeSimpleOpen";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr/ChatCircleDots";

import styles from "@/index.css?url";
import Footer from "./components/Footer";
import GradientHeading from "./components/GradientHeading";
import usePageUrl from "./hooks/usePageUrl";
import { Button } from "./components/ui/button";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", type: "image/png", href: "/icon.png" },
];

export const meta: MetaFunction = ({ error }) => {
  const origin =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : "https://www.secretmessag.es";
  const ogImagePath = "/og-image.jpg";
  const title = error
    ? isRouteErrorResponse(error) && error.status === 404
      ? error.statusText + " - secretmessag.es"
      : `An error occured! - secretmessag.es`
    : "Share confidential messages - secretmessag.es";

  return [
    {
      title,
    },
    { property: "og:title", content: title },
    {
      property: "og:image",
      content: origin + ogImagePath,
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: origin },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:image", content: origin + ogImagePath },
    {
      tagName: "link",
      rel: "canonical",
      href: origin,
    },
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
        className="flex min-h-[100dvh] flex-col text-balance bg-gradient-to-br
          from-rose-500/10 via-sky-500/10 to-fuchsia-500/10
          dark:from-[#6366F1]/10 dark:to-[#EC4899]/10"
      >
        <section className="flex w-full flex-1 pt-16 sm:py-16 md:py-24">
          {children}
        </section>
        <ScrollRestoration />
        <Scripts />
        <Footer />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const pageUrl = usePageUrl();
  const error = useRouteError();
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
          <Link to="/">
            <ChatCircleDots
              size={20}
              weight="duotone"
              className="-scale-x-100"
            />
            Create a secret message
          </Link>
        </Button>
        <Button asChild>
          <a
            href={`mailto:mail@nikolailehbr.ink?subject=Error on ${pageUrl}?body=Hello, I encountered an error on ${pageUrl} and I would like to report it. Here is what I did that caused the error:`}
          >
            <EnvelopeSimpleOpen size={20} weight="duotone" />
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
