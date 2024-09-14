import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
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
import { Analytics } from "@vercel/analytics/react";
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@vercel/remix";
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { origin } = new URL(request.url);
  return json(origin);
}

export const meta: MetaFunction<typeof loader> = ({ error, data: origin }) => {
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
    {
      tagName: "link",
      rel: "canonical",
      href: !import.meta.env.DEV
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : origin,
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
          from-rose-500/15 via-sky-500/15 to-fuchsia-500/15"
      >
        <section className="flex w-full flex-1 pb-4 pt-16 sm:pt-12 md:pt-24">
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

export function ErrorBoundary() {
  const pageUrl = usePageUrl();
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error;
  captureRemixErrorBoundaryError(error);
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

function App() {
  return <Outlet />;
}

export default withSentry(App);
