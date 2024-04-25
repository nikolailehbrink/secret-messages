import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import bcrypt from "bcryptjs";

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
  });
  return null;
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="text-4xl font-bold">Welcome to Remix</h1>
      <Form method="post">
        <input type="text" name="message" />
        <input type="text" name="password" />
        <button type="submit">Encrypt message</button>
      </Form>
    </div>
  );
}
