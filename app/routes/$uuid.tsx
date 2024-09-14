import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@vercel/remix";
import {
  Link,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import {
  deleteMessage,
  getMessage,
  markMessageAsViewed,
} from "@/.server/message";
import invariant from "tiny-invariant";
import { decryptText } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import ErrorOutput from "@/components/ErrorOutput";
import GradientContainer from "@/components/GradientContainer";

import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { LockKeyOpen } from "@phosphor-icons/react/dist/ssr/LockKeyOpen";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { Clipboard } from "@phosphor-icons/react/dist/ssr/Clipboard";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { XCircle } from "@phosphor-icons/react/dist/ssr/XCircle";
import { NumberCircleOne } from "@phosphor-icons/react/dist/ssr/NumberCircleOne";
import { ClockCountdown } from "@phosphor-icons/react/dist/ssr/ClockCountdown";
import { useRef, useState } from "react";
import PasswordVisibilityButton from "@/components/PasswordVisibilityButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dateTime } from "@/lib/helper";
import { messageNotFoundResponse } from "@/lib/response";

export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches
    .flatMap((match) => match.meta ?? [])
    .filter((meta) => !("title" in meta));

  const description = "Access it now using the separate send password.";
  const title = "You got a secret message!";

  return [
    ...parentMeta,
    {
      title: title + " - secretmessag.es",
    },
    {
      property: "og:title",
      content: title,
    },
    {
      name: "twitter:title",
      content: title,
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

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.uuid, "No uuid provided.");
  const message = await getMessage(params.uuid);
  const isMessageExpired = message?.expiresAt && message.expiresAt < new Date();
  const isOneTimeMessageAndViewed =
    message?.isOneTimeMessage && message?.isDecrypted;

  if (isMessageExpired || isOneTimeMessageAndViewed) {
    try {
      await deleteMessage(params.uuid);
    } catch (error) {
      console.error(error);
    }
  }

  if (!message || isMessageExpired || isOneTimeMessageAndViewed) {
    throw messageNotFoundResponse();
  }
  const url = request.url;

  return json(url);
}

// Prevents Remix from revalidating the loader after the message is successfully decrypted in the action function.
// By default, Remix re-runs the loader after an action to ensure the data is up-to-date.
// However, for one-time messages, revalidating would result in the message being marked as "viewed" and deleted.
// This function checks if the action has already decrypted and displayed the message.
// If so, it prevents revalidation to avoid throwing the "messageNotFoundResponse" in the loader.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  defaultShouldRevalidate,
}) => {
  // Only skip revalidation if the message was successfully decrypted and is a one-time-message.
  if (actionResult?.decryptedMessage && actionResult?.isOneTimeMessage) {
    return false;
  }
  return defaultShouldRevalidate;
};

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.uuid, "No uuid provided");
  const formData = await request.formData();
  const password = formData.get("password");

  if (!password || typeof password !== "string") {
    return json({
      decryptedMessage: null,
      createdAt: null,
      isOneTimeMessage: null,
      expiresAt: null,
      error: "Provide a password.",
    });
  }

  const message = await getMessage(params.uuid);

  if (!message) {
    throw messageNotFoundResponse();
  }

  const { encryptedContent, iv, createdAt, isOneTimeMessage, expiresAt } =
    message;

  try {
    const decryptedMessage = decryptText(encryptedContent, iv, password);
    if (!decryptedMessage) throw new Error("Failed to decrypt message.");

    await markMessageAsViewed(params.uuid);

    return json({
      decryptedMessage,
      expiresAt,
      createdAt,
      isOneTimeMessage,
      error: null,
    });
  } catch (error) {
    console.error(error);
    // https://github.com/remix-run/remix/discussions/8616
    return json({
      decryptedMessage: null,
      createdAt: null,
      isOneTimeMessage: null,
      expiresAt: null,
      error: "Incorrect password.",
    });
  }
}

export default function $uuid() {
  const url = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const passwordRef = useRef<HTMLInputElement>(null!);

  const { data, state } = fetcher;

  const submitting = state === "submitting";

  const error = data?.error;
  const decryptedMessage = data?.decryptedMessage;
  const creationDate =
    data?.createdAt && dateTime.format(new Date(data.createdAt));
  const expirationDate =
    data?.expiresAt && dateTime.format(new Date(data.expiresAt));

  const [copyToClipboardIcon, setCopyToClipboardIcon] = useState({
    icon: Clipboard,
  });

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
        <div className="relative space-y-2">
          <Label className="block text-left" htmlFor="password">
            Password
          </Label>
          {error && <ErrorOutput message={error} />}
          <div className="relative">
            <Input
              id="password"
              ref={passwordRef}
              placeholder={"Enter the password for the message"}
              type="password"
              name="password"
              autoComplete="one-time-code"
              className="pr-9"
              required
            />
            <PasswordVisibilityButton passwordRef={passwordRef} />
          </div>
        </div>
        <Button disabled={submitting} className="w-full">
          {submitting ? (
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
        <GradientContainer className="max-w-fit text-pretty break-all">
          <div
            className="relative flex h-full gap-2 rounded-md bg-white/50 p-1
              px-2 text-sm text-neutral-700 backdrop-blur-2xl"
          >
            <p className="line-clamp-1 self-center">{url}</p>
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
                await navigator.clipboard.writeText(url);
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
      {data?.isOneTimeMessage && (
        <div className="flex items-center gap-1 text-rose-500">
          <NumberCircleOne className="shrink-0" weight="duotone" size={28} />

          <p className="text-pretty text-xs">
            <span className="text-sm font-bold">One-Time Message:</span> <br />
            This message will become unavailable after closing or refreshing the
            tab.
          </p>
        </div>
      )}
      {!data?.isOneTimeMessage && expirationDate && (
        <div className="flex items-center gap-1 text-sky-500">
          <ClockCountdown className="shrink-0" size={28} weight="duotone" />

          <p className="text-pretty text-xs">
            <span className="text-sm font-bold">Expiring message:</span>
            <br /> This message will be available until {expirationDate}.
          </p>
        </div>
      )}
      <p
        className="rounded-lg rounded-es-none bg-white/75 p-4 px-5 shadow-md
          backdrop-blur-xl"
      >
        {decryptedMessage}
      </p>
      <p className="text-xs text-muted-foreground">{creationDate}</p>
      <Link
        className="group !mt-4 inline-flex gap-1 text-sm"
        to="/"
        prefetch="viewport"
      >
        <LockKey size={20} weight="duotone" />
        <span className="group-hover:underline group-hover:underline-offset-4">
          Create your own secret message
        </span>
      </Link>
    </div>
  );
}
