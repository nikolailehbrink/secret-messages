import EncryptForm from "@/components/EncryptForm";
import { href, data as json, redirect } from "react-router";
import { Await } from "react-router";
import {
  getMessageCount,
  incrementMessageCount,
  createMessage,
} from "@/.server/message";
import { z } from "zod/v4";
import GradientHeading from "@/components/GradientHeading";
import GradientContainer from "@/components/GradientContainer";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import ErrorOutput from "@/components/ErrorOutput";
import { Suspense } from "react";
import { FEATURES } from "@/constants/features";
import { EXPIRATION_TIMES_VALUES } from "@/constants/expiration-times";
import type { Route } from "./+types";

const description =
  "Share confidential messages with end-to-end encryption. Your message is encrypted in your browser before it ever leaves your device — the server never sees it. Create one-time messages, set expiration times, and share a unique link protected by a password.";

export const meta: Route.MetaFunction = ({ matches }) => {
  const parentMeta = matches.flatMap((match) => (match && match.meta) ?? []);

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

// The message is encrypted in the browser before submission, so the server
// validates the ciphertext blob (content + iv + salt) rather than the
// plaintext. Plaintext length is enforced client-side in the form.
const schema = z.object({
  encryptedContent: z
    .string()
    .min(1, "The encrypted message is missing.")
    .max(20_000, "The encrypted message is too large."),
  iv: z.string().min(1),
  salt: z.string().min(1),
  oneTimeMessage: z.literal("on").nullable(),
  // Pull the first value out explicitly to ensure proper type inference.
  // For more details, refer to: https://stackoverflow.com/a/73825370/14769333
  expirationTime: z.enum(["", ...EXPIRATION_TIMES_VALUES]),
});

export async function loader() {
  const messageCount = getMessageCount("all");
  return { messageCount };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const encryptedContent = formData.get("encrypted-content");
  const iv = formData.get("iv");
  const salt = formData.get("salt");
  const oneTimeMessage = formData.get("one-time-message");
  const expirationTime = formData.get("expiration-time");

  const { error, data } = schema.safeParse({
    encryptedContent,
    iv,
    salt,
    oneTimeMessage,
    expirationTime,
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
      data.encryptedContent,
      data.iv,
      data.salt,
      isOneTimeMessage,
      data.expirationTime ? parseInt(data.expirationTime) : null,
    );
    await Promise.all([
      isOneTimeMessage && incrementMessageCount("oneTime"),
      isExpiringMessage && incrementMessageCount("expiring"),
      isStandardMessage && incrementMessageCount("standard"),
      incrementMessageCount("all"),
    ]);
    return redirect(href("/:id", { id: uuid }));
  } catch (error) {
    // Handle unique constraint error
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return json(
        {
          uuidError:
            "An error occurred while attempting to save your message. Please try again.",
          formErrors: null,
        },
        { status: 500 },
      );
  }
}

export default function Index({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { messageCount } = loaderData;
  const uuidError = actionData?.uuidError;

  return (
    <div
      className="container flex h-full flex-col justify-center space-y-12 px-4
        sm:items-center sm:text-center md:space-y-16 md:px-6"
    >
      <div className="space-y-2">
        <GradientHeading
          className="text-4xl/snug text-shadow-md md:text-5xl/snug"
        >
          Secret Messages
        </GradientHeading>
        <p
          className="mx-auto max-w-screen-sm text-black/50 md:text-xl
            dark:text-neutral-400"
        >
          {description}
        </p>
        <GradientContainer
          className="mt-4 inline-flex rounded-xl shadow-lg shadow-sky-700/15"
          rotate
        >
          <div className="rounded-md bg-white/40 backdrop-blur-md">
            <p
              className="rounded-md bg-linear-to-br from-rose-500 via-sky-500
                to-fuchsia-500 bg-clip-text p-1 px-2 text-sm text-black/40
                backdrop-blur-md"
            >
              <Suspense fallback={<span>Wait a second...</span>}>
                <Await resolve={messageCount}>
                  {(messageCount) =>
                    messageCount > 0 ? (
                      <>
                        <span className="font-bold">{messageCount}</span> secret{" "}
                        {messageCount === 1 ? "message" : "messages"} already
                        created.
                      </>
                    ) : (
                      "Be the first to create a secret message!"
                    )
                  }
                </Await>
              </Suspense>
            </p>
          </div>
        </GradientContainer>
      </div>
      <div className="w-full md:max-w-lg">
        <EncryptForm />
        {uuidError && <ErrorOutput message={uuidError} />}
      </div>
      <section>
        <div className="flex flex-col items-start gap-4 md:items-center">
          <GradientContainer className="inline-flex shadow-lg shadow-sky-700/15">
            <div
              className="rounded-md bg-white/50 p-1 px-2 text-sm
                backdrop-blur-md"
            >
              <p className="relative">How it Works</p>
            </div>
          </GradientContainer>

          <GradientHeading
            className="text-3xl font-bold tracking-tighter text-shadow-sm
              sm:text-4xl lg:text-4xl"
            level="2"
          >
            Secure and Convenient
          </GradientHeading>
          <p
            className="max-w-screen-sm text-black/50 md:text-xl/relaxed
              lg:text-base/relaxed xl:text-lg/relaxed dark:text-neutral-400"
          >
            Your message is encrypted directly in your browser using your
            password and leaves your device as unreadable ciphertext. It can
            only be unlocked by someone with the correct password — not even our
            server can read it.
          </p>
        </div>
        <div
          className="mt-6 grid grid-cols-1 gap-4 sm:justify-items-center
            md:grid-cols-4 lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }, index) => {
            return (
              <GradientContainer
                className="w-full rounded-lg shadow-md shadow-sky-700/15
                  md:max-w-md md:max-lg:col-span-2 md:max-lg:last:col-start-2"
                key={title}
                rotate={index % 2 === 0}
              >
                <div
                  className="relative flex h-full flex-col items-center
                    justify-center space-y-1 rounded-md bg-white/50 p-4
                    text-center backdrop-blur-2xl"
                >
                  <Icon weight="duotone" className="drop-shadow-md" size={32} />
                  <GradientHeading
                    level="3"
                    className="text-xl font-bold text-shadow-xs"
                  >
                    {title}
                  </GradientHeading>
                  <p className="text-black/50">{description}</p>
                </div>
              </GradientContainer>
            );
          })}
        </div>
      </section>
    </div>
  );
}
