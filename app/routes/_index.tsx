import EncryptForm from "@/components/EncryptForm";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { storeMessage } from "prisma/message";

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

export default function Index() {
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
      </div>
    </div>
  );
}
