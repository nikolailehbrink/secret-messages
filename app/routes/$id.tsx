import {
  href,
  data as json,
  Link,
  type ShouldRevalidateFunction,
  useFetcher,
} from "react-router";
import {
  deleteMessage,
  getMessage,
  markMessageAsViewed,
} from "@/.server/message";
import { decryptText } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import ErrorOutput from "@/components/ErrorOutput";
import GradientContainer from "@/components/GradientContainer";
import {
  CircleNotchIcon,
  ClockCountdownIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
  NumberCircleOneIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import PasswordVisibilityButton from "@/components/PasswordVisibilityButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dateTime } from "@/lib/helper";
import { messageNotFoundResponse } from "@/lib/response";
import { CLIPBOARD_ICONS } from "@/constants/clipboard-icons";
import type { Route } from "./+types/$id";

type ClipboardStatus = "default" | "success" | "error";

export const meta: Route.MetaFunction = ({ matches }) => {
  const parentMeta = matches
    .flatMap((match) => (match && match.meta) ?? [])
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

export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = params;
  const message = await getMessage(id);
  const isMessageExpired = message?.expiresAt && message.expiresAt < new Date();
  const isOneTimeMessageAndViewed =
    message?.isOneTimeMessage && message?.isDecrypted;

  if (isMessageExpired || isOneTimeMessageAndViewed) {
    try {
      await deleteMessage(id);
    } catch (error) {
      console.error(error);
    }
  }

  if (!message || isMessageExpired || isOneTimeMessageAndViewed) {
    throw messageNotFoundResponse();
  }
  const url = request.url;

  return { url };
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

export async function action({ request, params }: Route.ActionArgs) {
  const { id } = params;
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

  const message = await getMessage(id);

  if (!message) {
    throw messageNotFoundResponse();
  }

  const { encryptedContent, iv, createdAt, isOneTimeMessage, expiresAt } =
    message;

  try {
    const decryptedMessage = decryptText(encryptedContent, iv, password);
    if (!decryptedMessage) throw new Error("Failed to decrypt message.");

    await markMessageAsViewed(id);

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

export default function Message({ loaderData }: Route.ComponentProps) {
  const { url } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const passwordRef = useRef<HTMLInputElement>(null);

  const { data, state } = fetcher;

  const isLoading = state !== "idle";

  const error = data?.error;
  const decryptedMessage = data?.decryptedMessage;
  const creationDate = data?.createdAt
    ? dateTime.format(new Date(data.createdAt))
    : null;
  const expirationDate = data?.expiresAt
    ? dateTime.format(new Date(data.expiresAt))
    : null;

  const [clipboardStatus, setClipboardStatus] =
    useState<ClipboardStatus>("default");
  const ClipboardIcon = CLIPBOARD_ICONS.get(clipboardStatus) ?? XCircleIcon;

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
              placeholder="Enter the password for the message"
              type="password"
              name="password"
              autoComplete="one-time-code"
              className="pr-9"
              required
            />
            <PasswordVisibilityButton passwordRef={passwordRef} />
          </div>
        </div>
        <Button disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <CircleNotchIcon className="animate-spin" size={20} />
              Decrypt message...
            </>
          ) : (
            <>
              <LockKeyOpenIcon size={24} weight="duotone" />
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
          className="h-px min-w-3 shrink-0 border-none bg-linear-to-r
            from-transparent to-black/15"
        />
        <p className="max-w-56 text-center">
          or copy the link to the message{" "}
          <noscript>from the adress bar</noscript>
        </p>
        <hr
          className="h-px min-w-3 shrink-0 rotate-180 border-none bg-linear-to-r
            from-transparent to-black/15"
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
            aria-label="Copy link to clipboard"
            className="relative size-9 border-none bg-white/50
              hover:bg-transparent"
            size="icon"
            variant="outline"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setClipboardStatus("success");
              } catch (error) {
                console.error(error);
                setClipboardStatus("error");
              } finally {
                setTimeout(() => {
                  setClipboardStatus("default");
                }, 2000);
              }
            }}
          >
            <ClipboardIcon size="20" weight="duotone" />
          </Button>
        </GradientContainer>
      </div>
    </div>
  ) : (
    <div className="container h-full max-w-xl space-y-2 self-center">
      {data?.isOneTimeMessage ? (
        <div className="flex items-center gap-1 text-rose-500">
          <NumberCircleOneIcon
            className="shrink-0"
            weight="duotone"
            size={28}
          />

          <p className="text-xs text-pretty">
            <span className="text-sm font-bold">One-Time Message:</span> <br />
            This message will become unavailable after closing or refreshing the
            tab.
          </p>
        </div>
      ) : null}
      {!data?.isOneTimeMessage && expirationDate !== null ? (
        <div className="flex items-center gap-1 text-sky-500">
          <ClockCountdownIcon className="shrink-0" size={28} weight="duotone" />

          <p className="text-xs text-pretty">
            <span className="text-sm font-bold">Expiring message:</span>
            <br /> This message will be available until {expirationDate}.
          </p>
        </div>
      ) : null}
      <p
        className="rounded-lg rounded-es-none bg-white/75 p-4 px-5 shadow-md
          backdrop-blur-xl"
      >
        {decryptedMessage}
      </p>
      <p className="text-xs text-muted-foreground">{creationDate}</p>
      <Link
        className="group !mt-4 inline-flex gap-1 text-sm"
        to={href("/")}
        prefetch="viewport"
      >
        <LockKeyIcon size={20} weight="duotone" />
        <span className="group-hover:underline group-hover:underline-offset-4">
          Create your own secret message
        </span>
      </Link>
    </div>
  );
}
