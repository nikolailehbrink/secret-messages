import {
  href,
  Link,
  type ShouldRevalidateFunction,
  useFetcher,
} from "react-router";
import {
  deleteMessage,
  getMessage,
  markMessageAsViewed,
} from "@/.server/message";
import { decryptText, decryptWithKey } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import ErrorOutput from "@/components/ErrorOutput";
import GradientContainer from "@/components/GradientContainer";
import MarkdownMessage from "@/components/MarkdownMessage";
import {
  CircleNotchIcon,
  ClockCountdownIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
  NumberCircleOneIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
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

  // Only the ciphertext, salt and IV leave the server — decryption happens in
  // the browser, so the server never sees the plaintext or the password.
  return {
    url: request.url,
    encryptedContent: message.encryptedContent,
    iv: message.iv,
    salt: message.salt,
    createdAt: message.createdAt,
    expiresAt: message.expiresAt,
    isOneTimeMessage: message.isOneTimeMessage,
  };
}

// After a one-time message is successfully decrypted in the browser, the client
// submits a "burn" so the server marks it as viewed. Skip revalidation
// afterwards: re-running the loader would mark it gone and 404 the page that is
// currently showing the decrypted message.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  defaultShouldRevalidate,
}) => {
  if (actionResult?.burned) {
    return false;
  }
  return defaultShouldRevalidate;
};

export async function action({ params }: Route.ActionArgs) {
  const { id } = params;
  await markMessageAsViewed(id);
  return { burned: true };
}

export default function Message({ loaderData }: Route.ComponentProps) {
  const {
    url,
    encryptedContent,
    iv,
    salt,
    createdAt,
    expiresAt,
    isOneTimeMessage,
  } = loaderData;
  const burnFetcher = useFetcher();
  const passwordRef = useRef<HTMLInputElement>(null);

  // Password-protected messages store a salt; passwordless messages don't —
  // their key travels in the URL fragment instead.
  const isPasswordProtected = salt !== null;

  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // The link to share/copy. The loader only sees the path (the fragment never
  // reaches the server), so on the client we use the full href, which includes
  // the passwordless key fragment.
  const [shareUrl, setShareUrl] = useState(url);
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const creationDate = dateTime.format(new Date(createdAt));
  const expirationDate = expiresAt ? dateTime.format(new Date(expiresAt)) : null;

  const [clipboardStatus, setClipboardStatus] =
    useState<ClipboardStatus>("default");
  const ClipboardIcon = CLIPBOARD_ICONS.get(clipboardStatus) ?? XCircleIcon;

  const [messageCopyStatus, setMessageCopyStatus] =
    useState<ClipboardStatus>("default");
  const MessageCopyIcon =
    CLIPBOARD_ICONS.get(messageCopyStatus) ?? XCircleIcon;

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(decryptedMessage ?? "");
      setMessageCopyStatus("success");
    } catch (error) {
      console.error(error);
      setMessageCopyStatus("error");
    } finally {
      setTimeout(() => setMessageCopyStatus("default"), 2000);
    }
  }

  function onDecrypted(message: string) {
    setDecryptedMessage(message);
    if (isOneTimeMessage) {
      // Burn the one-time message now that it has been read.
      burnFetcher.submit(null, { method: "post" });
    }
  }

  async function handleDecrypt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salt === null) return;
    const password = passwordRef.current?.value ?? "";
    if (!password) {
      setError("Provide a password.");
      return;
    }
    setError(null);
    setIsDecrypting(true);
    try {
      onDecrypted(await decryptText(encryptedContent, iv, salt, password));
    } catch (error) {
      console.error(error);
      // AES-GCM authentication fails on a wrong password or tampered data.
      setError("Incorrect password.");
    } finally {
      setIsDecrypting(false);
    }
  }

  async function handleReveal() {
    // The key lives in the URL fragment, which is never sent to the server.
    const key = window.location.hash.replace(/^#/, "");
    if (!key) {
      setError(
        "This link is missing its decryption key. Make sure you copied the full link, including everything after the “#”.",
      );
      return;
    }
    setError(null);
    setIsDecrypting(true);
    try {
      onDecrypted(await decryptWithKey(encryptedContent, iv, key));
    } catch (error) {
      console.error(error);
      setError("Could not decrypt this message — the link may be corrupted.");
    } finally {
      setIsDecrypting(false);
    }
  }

  return decryptedMessage === null ? (
    <div
      className="container flex flex-col items-center space-y-6 self-center px-4
        md:px-6"
    >
      {isPasswordProtected ? (
        <form
          id="form"
          method="post"
          onSubmit={handleDecrypt}
          className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white/50
            p-4 text-left shadow-lg ring-2 ring-neutral-50 backdrop-blur-md"
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
          <Button disabled={isDecrypting} className="w-full">
            {isDecrypting ? (
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
        </form>
      ) : (
        <div
          className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-white/50
            p-4 text-left shadow-lg ring-2 ring-neutral-50 backdrop-blur-md"
        >
          <div className="flex gap-1.5 text-sm text-sky-700">
            <LockKeyOpenIcon size={20} weight="duotone" className="shrink-0" />
            <p>
              This message unlocks with the link itself — no password needed.
            </p>
          </div>
          {error && <ErrorOutput message={error} />}
          <Button
            type="button"
            onClick={handleReveal}
            disabled={isDecrypting}
            className="w-full"
          >
            {isDecrypting ? (
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
        </div>
      )}
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
            <p className="line-clamp-1 self-center select-all">{shareUrl}</p>
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
                await navigator.clipboard.writeText(shareUrl);
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
    <div className="container flex items-center gap-y-3">
      <div
        className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-lg
          bg-white/50 p-4 shadow-lg ring-2 shadow-sky-700/20 ring-neutral-50
          backdrop-blur-md"
      >
        {isOneTimeMessage ? (
          <div
            className="flex gap-1 rounded-lg border border-rose-300 bg-rose-200
              p-3 text-sm text-rose-700"
          >
            <NumberCircleOneIcon
              className="shrink-0"
              weight="duotone"
              size={20}
            />
            <div className="text-pretty">
              <p className="font-bold">One-Time Message:</p>
              <p className="text-xs">
                This message will become unavailable after closing or refreshing
                the tab.
              </p>
            </div>
          </div>
        ) : expirationDate !== null ? (
          <div
            className="flex gap-1 rounded-lg border border-sky-300 bg-sky-200
              p-3 text-sm text-sky-700"
          >
            <ClockCountdownIcon
              className="shrink-0"
              size={20}
              weight="duotone"
            />
            <div className="text-pretty">
              <p className="font-bold">Expiring message:</p>
              <p className="text-xs">
                This message will be available until{" "}
                <strong> {expirationDate}</strong>.
              </p>
            </div>
          </div>
        ) : null}
        <GradientContainer className="rounded-2xl rounded-es-md shadow-lg shadow-sky-700/15">
          <div
            className="overflow-hidden rounded-2xl rounded-es-md bg-white/85
              backdrop-blur-xl"
          >
            <div
              className="flex items-center justify-between gap-2 border-b
                border-black/5 bg-linear-to-r from-white/60 to-transparent px-4
                py-2"
            >
              <div
                className="flex items-center gap-1.5 text-sm font-medium
                  text-sky-700"
              >
                <LockKeyOpenIcon size={16} weight="duotone" />
                Decrypted message
              </div>
              <Button
                aria-label="Copy message to clipboard"
                variant="ghost"
                size="icon"
                type="button"
                className="size-7 text-neutral-500 hover:text-neutral-900"
                onClick={copyMessage}
              >
                <MessageCopyIcon size={16} weight="duotone" />
              </Button>
            </div>
            <div className="px-5 py-4">
              <MarkdownMessage>{decryptedMessage}</MarkdownMessage>
            </div>
            <p className="px-5 pb-3 text-right text-xs text-muted-foreground">
              {creationDate}
            </p>
          </div>
        </GradientContainer>
        <Button asChild className="mt-2">
          <Link to={href("/")} prefetch="viewport">
            <LockKeyIcon size={20} weight="duotone" />
            Create your own secret message
          </Link>
        </Button>
      </div>
    </div>
  );
}
