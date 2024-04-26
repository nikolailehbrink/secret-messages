import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, json, redirect, useLoaderData } from "@remix-run/react";
import { getMessages, storeMessage } from "prisma/message";
import { useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const message = body.get("message");
  const password = body.get("password");
  if (!password || !message) {
    return new Response("Missing message or password", {
      status: 400,
    });
  }
  const data = await storeMessage(message.toString(), password.toString());
  return redirect(`/${data.uuid}`);
}
export async function loader() {
  const messages = await getMessages();
  return json(messages);
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="container mx-auto">
      <Form id="form" method="post">
        <input type="text" name="message" />
        <input type="text" name="password" />
        <button
          id="openDialog"
          type="button"
          onClick={() => dialogRef.current?.showModal()}
        >
          Encrypt message
        </button>
        <dialog
          id="dialog"
          ref={dialogRef}
          className="rounded-lg border-2 border-neutral-300 backdrop:bg-black/30"
        >
          <div className="flex flex-col gap-2 p-4">
            Do you really want to encrypt the message?
            <div className="flex flex-wrap justify-between gap-4">
              <button type="submit">Encrypt message</button>
              <button
                onClick={() => dialogRef.current?.close()}
                id="closeDialog"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      </Form>
      {/* <script
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('form');
            const dialog = form.querySelector('#dialog');
            const openDialogButton = form.querySelector('#openDialog');
            const closeDialogButton = form.querySelector('#closeDialog');
            console.log(dialog);
            openDialogButton.addEventListener('click', () => {
              dialog.showModal();
            });
            closeDialogButton.addEventListener('click', () => {
              console.log("close dialog")
              dialog.close();
            });
          });
        `,
        }}
      /> */}

      <div className="mx-auto flex max-w-sm flex-col gap-2">
        {data
          .map(({ encryptedContent, uuid, id }) => (
            <div
              key={id}
              className="flex items-center justify-between gap-2 bg-neutral-100
                p-4"
            >
              <span>{encryptedContent}</span>
              <Link
                to={`/${uuid}`}
                className="rounded-lg bg-neutral-300 px-4 py-2"
              >
                View
              </Link>
            </div>
          ))
          .reverse()}
      </div>
    </div>
  );
}
