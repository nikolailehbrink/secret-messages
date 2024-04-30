import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@vercel/remix";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { getMessage } from "prisma/message";
import invariant from "tiny-invariant";
import { decryptText } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { LockKeyOpen } from "@phosphor-icons/react/dist/ssr/LockKeyOpen";
import ErrorOutput from "@/components/ErrorOutput";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.uuid, "No uuid provided");

  const message = await getMessage(params.uuid);
  if (!message) {
    throw new Response("Not found", { status: 404 });
  }
  return json({ message });
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
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const decryptedMessage = actionData?.decryptedMessage;
  const creationDate = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(loaderData.message.createdAt));
  const error = actionData?.error;

  return !decryptedMessage ? (
    <div
      className="container h-full w-full max-w-sm space-y-6 self-center px-4
        md:px-6"
    >
      <Form id="form" method="post" className="flex flex-col gap-4">
        <PasswordInput placeholderText="Enter the password for the message" />
        <Button className="w-full">
          <LockKeyOpen size={24} weight="duotone" />
          Show message
        </Button>
        {error && <ErrorOutput message={error} />}
      </Form>
      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm
          text-muted-foreground"
      >
        <hr className="min-w-3 shrink-0 border-neutral-300" />
        <p className="max-w-56 text-center">
          or copy the link to the message{" "}
          <noscript>from the adress bar</noscript>
        </p>
        <hr className="min-w-3 shrink-0 border-neutral-300" />
      </div>

      <div
        id="url"
        className="hidden w-full select-all rounded-md border border-input
          bg-background px-3 py-2 text-sm text-neutral-600"
      ></div>
      <noscript className="hidden">
        <style>
          {`
          #url {
            display: none;
          }
          `}
        </style>
      </noscript>
      <script
        className="hidden"
        dangerouslySetInnerHTML={{
          __html: `
        document.addEventListener('DOMContentLoaded', () => {
          const url = document.getElementById("url");
          const href = window.location.href;
          url.style.display = "flex";
          url.textContent = href;
          });
        `,
        }}
      ></script>
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
