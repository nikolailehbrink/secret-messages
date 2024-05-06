import EncryptForm from "@/components/EncryptForm";
import type { ActionFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, redirect, useActionData, useLoaderData } from "@remix-run/react";
import { getMessageCount, storeMessage } from "prisma/message";
import { z } from "zod";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { LinkSimple } from "@phosphor-icons/react/dist/ssr/LinkSimple";
import { Detective } from "@phosphor-icons/react/dist/ssr/Detective";
import GradientHeading from "@/components/GradientHeading";
import GradientContainer from "@/components/GradientContainer";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import ErrorOutput from "@/components/ErrorOutput";

export const meta: MetaFunction = () => {
  return [
    { title: "secretmessag.es - Share confidential messages" },
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
    title: "Anonymous",
    description: "No IP addresses or personal information is stored.",
    icon: Detective,
  },
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
];

export async function loader() {
  const messageCount = await getMessageCount();
  return json({ messageCount });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = String(formData.get("message"));
  const password = String(formData.get("password"));

  const { error, data } = schema.safeParse({ message, password });

  if (error) {
    return json(
      { formErrors: error.flatten(), uuidError: null },
      { status: 400 },
    );
  }
  try {
    const { uuid } = await storeMessage(data.message, data.password);
    return redirect(`/${uuid}`);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return json({
        uuidError:
          "An error occurred while attempting to save your message. Please try again.",
        formErrors: null,
      });
  }
}

export default function Index() {
  const { messageCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formErrors = actionData?.formErrors;
  const uuidError = actionData?.uuidError;
  return (
    <div
      className="container flex h-full flex-col items-center justify-center
        space-y-8 px-4 text-center md:space-y-16 md:px-6"
    >
      <div className="space-y-2 sm:space-y-4">
        <GradientHeading className="text-4xl md:text-5xl lg:text-6xl/snug">
          Secret Messages
        </GradientHeading>
        <p
          className="mx-auto max-w-[700px] text-neutral-600
            dark:text-neutral-400 md:text-xl"
        >
          Share confidential messages with your friends and family securely.
          Create a unique link and password to access your message.
        </p>
        <GradientContainer className="!mt-8 inline-flex" rotate>
          <div className="rounded-md bg-white/40 backdrop-blur-md">
            <p
              className="rounded-md bg-gradient-to-br from-rose-500 via-sky-500
                to-fuchsia-500 bg-clip-text p-1 px-2 text-sm text-black/40
                backdrop-blur-md"
            >
              <span className="font-bold">{messageCount}</span> secret{" "}
              {messageCount === 1 ? "message" : "messages"} already created.
            </p>
          </div>
        </GradientContainer>
      </div>
      <div className="w-full max-w-md space-y-4">
        <EncryptForm errors={formErrors} />
        {uuidError && <ErrorOutput message={uuidError} />}
      </div>
      <section className="py-8 sm:p-12">
        <div className="space-y-4">
          <GradientContainer className="inline-flex">
            <div
              className="rounded-md bg-white/50 p-1 px-2 text-sm
                backdrop-blur-md"
            >
              <p className="relative">How it Works</p>
            </div>
          </GradientContainer>

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
          className="mt-6 grid max-w-5xl grid-cols-1 justify-items-center gap-4
            md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, description }, index) => {
            return (
              <GradientContainer
                className="w-full max-w-md"
                key={title}
                rotate={index % 2 === 0}
              >
                <div
                  className="relative flex h-full flex-col items-center
                    justify-center space-y-1 rounded-md bg-white/50 p-4
                    text-neutral-700 backdrop-blur-2xl"
                >
                  <Icon weight="duotone" size={32} />
                  <GradientHeading level="3" className="text-xl font-bold">
                    {title}
                  </GradientHeading>
                  <p>{description}</p>
                </div>
              </GradientContainer>
            );
          })}
        </div>
      </section>
    </div>
  );
}
