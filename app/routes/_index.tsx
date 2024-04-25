import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

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
  console.log({ message, password });
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
