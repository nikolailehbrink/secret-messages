import EncryptForm from "@/components/EncryptForm";
import ErrorOutput from "@/components/ErrorOutput";
import type { ActionFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, redirect, useActionData } from "@remix-run/react";
import { storeMessage } from "prisma/message";
import { z } from "zod";

export const meta: MetaFunction = () => {
  return [
    { title: "Secret Message App" },
    { name: "description", content: "Share confidential messages securely." },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = String(formData.get("message"));
  const password = String(formData.get("password"));
  const schema = z.object({
    message: z
      .string()
      .min(2, "Message needs at least two characters.")
      .max(500, "Message can't be longer than 500 characters."),
    password: z.string().min(4, "Password needs at least four characters."),
  });
  const { error, data } = schema.safeParse({ message, password });
  if (error) {
    return json({ errors: error.errors }, { status: 400 });
  }
  const { uuid } = await storeMessage(data.message, data.password);
  return redirect(`/${uuid}`);
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  // actionData?.error && console.log(actionData.error);
  return (
    <div
      className="container flex h-full flex-col items-center justify-center
        space-y-8 px-4 text-center md:px-6"
    >
      <div className="space-y-4">
        <h1
          className="bg-gradient-to-br from-neutral-950 to-neutral-500
            bg-clip-text text-3xl font-bold tracking-tighter text-transparent
            sm:text-4xl md:text-5xl lg:text-6xl/snug"
        >
          Secret Message
        </h1>
        <p
          className="mx-auto max-w-[700px] text-neutral-500
            dark:text-neutral-400 md:text-xl"
        >
          Share confidential messages with your friends and family securely.
          Create a unique link and password to access your message.
        </p>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <EncryptForm />
        {errors &&
          errors.length > 0 &&
          errors.map(({ message }, i) => (
            <ErrorOutput
              className="bg-red-100 px-2 py-3"
              key={i}
              message={message}
            />
          ))}
      </div>
    </div>
  );
}
