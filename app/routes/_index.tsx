import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import { getMessages, storeMessage } from "prisma/message";

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

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="text-4xl font-bold">Welcome to Remix</h1>
      <Form method="post">
        <input type="text" name="message" />
        <input type="text" name="password" />
        <button type="submit">Encrypt message</button>
      </Form>
      {data
        .map(({ message, password: hash, uuid, id }) => (
          <div key={id} className="flex gap-2">
            <span>{message}</span>
            <span className="bg-green-300">{hash}</span>
            <span className="bg-red-300">{uuid}</span>
          </div>
        ))
        .reverse()}
    </div>
  );
}
