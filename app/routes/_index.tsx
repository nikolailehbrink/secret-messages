import EncryptForm from "@/components/EncryptForm";
import type { ActionFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, redirect, defer } from "@vercel/remix";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import {
  getMessageCount,
  incrementMessageCount,
  createMessage,
} from "@/.server/message";
import { z } from "zod";
import GradientHeading from "@/components/GradientHeading";
import GradientContainer from "@/components/GradientContainer";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import ErrorOutput from "@/components/ErrorOutput";
import { Suspense } from "react";
import { FEATURES } from "@/constants/features";
import { EXPIRATION_TIMES_VALUES } from "@/constants/expiration-times";

const description =
  "Share confidential messages securely with anyone. Create one-time read messages and set expiration times. Generate unique links and passwords for exclusive access.";

export const meta: MetaFunction = ({ matches }) => {
  const parentMeta = matches.flatMap((match) => match.meta ?? []);
  return [
    ...parentMeta,
    {
      name: "description",
      content: description,
    },
    { property: "og:description", content: description },
    { name: "twitter:description", content: description },
  ];
};

export type FlattenedErrors = z.inferFlattenedErrors<typeof schema>;

const schema = z.object({
  message: z
    .string()
    .min(2, "The message needs at least two characters.")
    .max(500, "The message can't be longer than 500 characters."),
  oneTimeMessage: z.literal("on").nullable(),
  // Pull the first value out explicitly, like mentioned in https://stackoverflow.com/a/73825370/14769333
  expirationTime: z.enum(["", ...EXPIRATION_TIMES_VALUES]),
  password: z.string().min(4, "The password needs at least four characters."),
});

export async function loader() {
  const messageCount = getMessageCount("all");
  return defer({ messageCount });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get("message");
  const oneTimeMessage = formData.get("one-time-message");
  const expirationTime = formData.get("expiration-time");
  const password = formData.get("password");

  const { error, data } = schema.safeParse({
    message,
    oneTimeMessage,
    expirationTime,
    password,
  });

  if (error) {
    return json(
      { formErrors: error.flatten(), uuidError: null },
      { status: 400 },
    );
  }
  const isOneTimeMessage = data.oneTimeMessage === "on";
  const isExpiringMessage = data.expirationTime !== "";
  const isStandardMessage = !isOneTimeMessage && !isExpiringMessage;
  try {
    const { uuid } = await createMessage(
      data.message,
      isOneTimeMessage,
      parseInt(data.expirationTime) || null,
      data.password,
    );
    await Promise.all([
      isOneTimeMessage && incrementMessageCount("oneTime"),
      isExpiringMessage && incrementMessageCount("expiring"),
      isStandardMessage && incrementMessageCount("standard"),
      incrementMessageCount("all"),
    ]);
    return redirect(`/${uuid}`);
  } catch (error) {
    // Handle unique constraint error
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
        space-y-12 px-4 text-center md:space-y-16 md:px-6"
    >
      <div>
        <GradientHeading
          className="text-4xl/snug md:text-5xl/snug lg:text-6xl/snug"
        >
          Secret Messages
        </GradientHeading>
        <p
          className="mx-auto max-w-[700px] text-neutral-600
            dark:text-neutral-400 md:text-xl"
        >
          {description}
        </p>
        <GradientContainer className="mt-4 inline-flex" rotate>
          <div className="rounded-md bg-white/40 backdrop-blur-md">
            <p
              className="rounded-md bg-gradient-to-br from-rose-500 via-sky-500
                to-fuchsia-500 bg-clip-text p-1 px-2 text-sm text-black/40
                backdrop-blur-md"
            >
              <Suspense fallback={<span>Wait a second...</span>}>
                <Await resolve={messageCount}>
                  {(messageCount) => (
                    <>
                      <span className="font-bold">{messageCount}</span> secret{" "}
                      {messageCount === 1 ? "message" : "messages"} already
                      created.
                    </>
                  )}
                </Await>
              </Suspense>
            </p>
          </div>
        </GradientContainer>
      </div>
      <div className="w-full max-w-md">
        <EncryptForm errors={formErrors} />
        {uuidError && <ErrorOutput message={uuidError} />}
      </div>
      <section>
        <div className="flex flex-col items-center gap-3">
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
          className="mt-6 grid max-w-5xl auto-rows-fr grid-cols-1
            justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }, index) => {
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
