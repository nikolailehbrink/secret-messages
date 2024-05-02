import EncryptForm from "@/components/EncryptForm";
import type { ActionFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, redirect, useActionData } from "@remix-run/react";
import { storeMessage } from "prisma/message";
import { z } from "zod";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { LinkSimple } from "@phosphor-icons/react/dist/ssr/LinkSimple";
import { UsersThree } from "@phosphor-icons/react/dist/ssr/UsersThree";
import GradientHeading from "@/components/GradientHeading";
import { cn } from "@/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Secret Message App" },
    { name: "description", content: "Share confidential messages securely." },
  ];
};

const schema = z.object({
  message: z
    .string()
    .min(2, "The message needs at least two characters.")
    .max(500, "The message can't be longer than 500 characters."),
  password: z.string().min(4, "The password needs at least four characters."),
});

export type FlattenedErrors = z.inferFlattenedErrors<typeof schema>;

const features = [
  {
    title: "Secure",
    description: "Your message is encrypted and protected with a password.",
    icon: LockKey,
  },
  {
    title: "Shareable",
    description: "Generate a unique link to share your message with others.",
    icon: LinkSimple,
  },
  {
    title: "Accessible",
    description:
      "No registration for you or your recipient. Just a password to access the message.",
    icon: UsersThree,
  },
];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = String(formData.get("message"));
  const password = String(formData.get("password"));

  const { error, data } = schema.safeParse({ message, password });

  if (error) {
    return json({ errors: error.flatten() }, { status: 400 });
  }
  const { uuid } = await storeMessage(data.message, data.password);
  return redirect(`/${uuid}`);
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  return (
    <div
      className="container flex h-full flex-col items-center justify-center
        space-y-8 px-4 text-center md:space-y-16 md:px-6"
    >
      <div className="space-y-2 sm:space-y-4">
        <GradientHeading className="text-4xl md:text-5xl lg:text-6xl/snug">
          Secret Message
        </GradientHeading>
        <p
          className="mx-auto max-w-[700px] text-neutral-600
            dark:text-neutral-400 md:text-xl"
        >
          Share confidential messages with your friends and family securely.
          Create a unique link and password to access your message.
        </p>
      </div>
      <div className="w-full max-w-md space-y-4">
        <EncryptForm errors={errors} />
      </div>
      <section className="py-8 sm:p-12">
        <div className="space-y-4">
          <div className="relative inline-block rounded-full">
            <div
              className="absolute -inset-[2px] -z-10 rounded-full
                bg-gradient-to-br from-rose-500/20 via-sky-500/20
                to-fuchsia-500/20"
            ></div>
            <div
              className="inline-block rounded-full bg-white/30 p-1 px-2 text-sm
                backdrop-blur-md"
            >
              <p className="relative">How it Works</p>
            </div>
          </div>
          <GradientHeading
            className="text-3xl font-bold tracking-tighter sm:text-4xl
              lg:text-4xl"
            level="2"
          >
            Secure and Convenient
          </GradientHeading>
          <p
            className="max-w-[900px] text-neutral-600 dark:text-neutral-400
              md:text-xl/relaxed lg:text-base/relaxed xl:text-lg/relaxed"
          >
            Our secret message app allows you to create a unique link and
            password to share confidential information securely. Your message is
            protected and can only be accessed by those with the correct
            password.
          </p>
        </div>
        <div
          className="mt-6 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2
            lg:grid-cols-3"
        >
          {features.map(({ icon, title, description }, index) => {
            const Icon = icon;

            return (
              <div className="relative flex flex-col" key={title}>
                <div
                  className={cn(
                    `absolute inset-0 rounded-lg bg-gradient-to-bl from-rose-500
                    via-sky-500 to-fuchsia-500 opacity-15 blur-md`,
                    index % 2 === 0 && "bg-gradient-to-tl sm:bg-gradient-to-br",
                  )}
                ></div>
                <div
                  className={cn(
                    `absolute -inset-[2px] rounded-lg bg-gradient-to-bl
                    from-rose-500 via-sky-500 to-fuchsia-500 opacity-20`,
                    index % 2 === 0 && "bg-gradient-to-tl sm:bg-gradient-to-br",
                  )}
                ></div>
                <div
                  className="relative flex h-full flex-col items-center
                    justify-center space-y-1 rounded-md bg-white/40 p-4
                    text-neutral-600 backdrop-blur-2xl"
                >
                  <Icon weight="duotone" size={32} />
                  <GradientHeading level="3" className="text-xl font-bold">
                    {title}
                  </GradientHeading>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
