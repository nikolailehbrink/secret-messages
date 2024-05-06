import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@vercel/remix";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { getMessage } from "prisma/message";
import invariant from "tiny-invariant";
import { decryptText } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { LockKeyOpen } from "@phosphor-icons/react/dist/ssr/LockKeyOpen";
import ErrorOutput from "@/components/ErrorOutput";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { Clipboard } from "@phosphor-icons/react/dist/ssr/Clipboard";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { XCircle } from "@phosphor-icons/react/dist/ssr/XCircle";

import usePageUrl from "@/hooks/usePageUrl";
import GradientContainer from "@/components/GradientContainer";
import { useState } from "react";

export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches
    .flatMap((match) => match.meta ?? [])
    .filter((meta) => !("title" in meta));

  const description =
    "A secret message is waiting for you. Decrypt it with the password.";

  return [
    ...parentMeta,
    {
      title: "You got a message! - secretmessag.es",
    },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.uuid, "No uuid provided");

  const message = await getMessage(params.uuid);
  if (!message) {
    throw new Response(
      `The message you are looking for does not exist. Please check the URL and try again.`,
      {
        status: 404,
        statusText: "Message not found!",
      },
    );
  }
  const { createdAt } = message;
  return json({ createdAt });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.uuid, "No uuid provided");

  const message = await getMessage(params.uuid);

  const password = (await request.formData()).get("password");

  if (!password || !message) {
    throw new Response("No password or message provided", { status: 404 });
  }

  const { encryptedContent, iv } = message;
  try {
    const decryptedMessage = decryptText(
      encryptedContent,
      iv,
      password.toString(),
    );
    if (!decryptedMessage) throw new Error("Failed to decrypt");

    return json({ decryptedMessage, error: null });
  } catch (error) {
    console.log(error);
    // https://github.com/remix-run/remix/discussions/8616
    return json({ decryptedMessage: null, error: "Incorrect password" });
  }
}

export default function $uuid() {
  const fetcher = useFetcher<typeof action>();
  const { createdAt } = useLoaderData<typeof loader>();
  const { data, state } = fetcher;
  const decryptedMessage = data?.decryptedMessage;
  const creationDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(createdAt));
  const error = data?.error;
  const [copyToClipboardIcon, setCopyToClipboardIcon] = useState({
    icon: Clipboard,
  });

  const pageUrl = usePageUrl();

  return !decryptedMessage ? (
    <div
      className="container flex flex-col items-center space-y-6 self-center px-4
        md:px-6"
    >
      <fetcher.Form
        id="form"
        method="post"
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <PasswordInput placeholderText="Enter the password for the message" />
        {error && <ErrorOutput message={error} />}
        <Button disabled={state === "submitting"} className="w-full">
          {state === "submitting" ? (
            <>
              <CircleNotch className="animate-spin" size={20} />
              Decrypt message...
            </>
          ) : (
            <>
              <LockKeyOpen size={24} weight="duotone" />
              Show message
            </>
          )}
        </Button>
      </fetcher.Form>
      <div
        className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3
          text-sm text-muted-foreground"
      >
        <hr
          className="h-px min-w-3 shrink-0 border-none bg-gradient-to-r
            from-transparent to-black/15"
        />
        <p className="max-w-56 text-center">
          or copy the link to the message{" "}
          <noscript>from the adress bar</noscript>
        </p>
        <hr
          className="h-px min-w-3 shrink-0 rotate-180 border-none
            bg-gradient-to-r from-transparent to-black/15"
        />
      </div>
      <div className="flex gap-2">
        <GradientContainer className="max-w-fit text-pretty break-all ">
          <div
            className="relative flex h-full gap-2 rounded-md bg-white/50 p-1
              px-2 text-sm text-neutral-700 backdrop-blur-2xl"
          >
            <p className="line-clamp-1 self-center">{pageUrl}</p>
          </div>
        </GradientContainer>
        <GradientContainer className="inline-flex self-start">
          <Button
            className="relative size-9 border-none bg-white/50
              hover:bg-transparent"
            size="icon"
            variant="outline"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(pageUrl);
                setCopyToClipboardIcon({ icon: CheckCircle });
              } catch (error) {
                setCopyToClipboardIcon({ icon: XCircle });
              } finally {
                setTimeout(() => {
                  setCopyToClipboardIcon({ icon: Clipboard });
                }, 2000);
              }
            }}
          >
            {copyToClipboardIcon.icon && (
              <copyToClipboardIcon.icon weight="duotone" size={20} />
            )}
          </Button>
        </GradientContainer>
      </div>
    </div>
  ) : (
    <div className="container h-full max-w-xl space-y-2 self-center">
      <p
        className="rounded-lg rounded-es-none bg-white/75 p-4 px-5 shadow-md
          backdrop-blur-xl"
      >
        {decryptedMessage}
      </p>
      <p className="text-xs text-muted-foreground">{creationDate}</p>
      <Link className="group !mt-4 inline-flex gap-1 text-sm" to="/">
        <LockKey size={20} weight="duotone" />
        <span className="group-hover:underline group-hover:underline-offset-4">
          Create your own secret message
        </span>
      </Link>
    </div>
  );
}
