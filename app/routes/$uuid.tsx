import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@vercel/remix";
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
import usePageUrl from "@/hooks/usePageUrl";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.uuid, "No uuid provided");

  const message = await getMessage(params.uuid);
  if (!message) {
    throw new Response("Not found", { status: 404 });
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
        {error && <ErrorOutput message={error} />}
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

      <div
        id="url"
        className="relative max-w-fit text-pretty break-all rounded-md
          bg-black/5 px-3 py-2 pr-10 text-sm text-neutral-600"
      >
        <Button
          className="absolute right-[2px] top-[2px] size-8 text-neutral-900
            hover:bg-neutral-100"
          size="icon"
          variant="ghost"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(pageUrl);
              console.log("Copied to clipboard");
            } catch (error) {
              console.error("Failed to copy to clipboard", error);
            }
          }}
        >
          <Clipboard size={20} weight="duotone" />
        </Button>
        <div className="absolute right-0"></div>
        {pageUrl}
      </div>
      <noscript className="hidden">
        <style>
          {`
          #url {
            display: none;
          }
          `}
        </style>
      </noscript>
    </div>
  ) : (
    <div className="container h-full max-w-xl space-y-2 self-center">
      <p
        className="rounded-xl rounded-es-none bg-white/75 p-4 px-5 shadow-md
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
