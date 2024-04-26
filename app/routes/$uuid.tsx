import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getMessage } from "prisma/message";
import invariant from "tiny-invariant";
import { decryptText } from "@/lib/crypto";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.uuid, "No uuid provided");

  const message = await getMessage(params.uuid);
  if (!message) {
    throw new Response("Not found", { status: 404 });
  }
  return null;
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
  const data = useActionData<typeof action>();
  const decryptedMessage = data?.decryptedMessage;
  const error = data?.error;

  return (
    <div>
      <Form method="post">
        <label>
          Passwort
          <input type="text" name="password" />
          <button type="submit">Send it</button>
        </label>
      </Form>
      <div>
        {decryptedMessage && (
          <p className="text-3xl font-bold">{decryptedMessage}</p>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <p>Encrypted message</p>
    </div>
  );
}
