import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import bcrypt from "bcryptjs";
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
  bcrypt.hash(password.toString(), saltRounds, (err, hash) => {
    console.log(message);
    console.log({ err, hash });
    storeMessage(message.toString(), hash);
  });
  return null;
}
export async function loader() {
  return json(await getMessages());
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      {data.map(({ message, password: hash, id }) => (
        <div key={id}>
          {message}
          {hash}
        </div>
      ))}
      <h1 className="text-4xl font-bold">Welcome to Remix</h1>
      <Form method="post">
        <input type="text" name="message" />
        <input type="text" name="password" />
        <button type="submit">Encrypt message</button>
      </Form>
    </div>
  );
}
