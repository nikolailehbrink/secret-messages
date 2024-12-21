import EncryptForm from "@/components/EncryptForm";
import { data, type MetaFunction } from "react-router";
import { Await, redirect } from "react-router";
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
import { Suspense, useMemo, useRef } from "react";
import { FEATURES } from "@/constants/features";
import { EXPIRATION_TIMES_IN_MINUTES } from "@/constants/expiration-times";
import { useGSAP, gsap } from "@/lib/gsap";
import type { Route } from "./+types";

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

const schema = z.object({
  message: z
    .string()
    .min(2, "The message needs at least two characters.")
    .max(500, "The message can't be longer than 500 characters."),
  oneTimeMessage: z.literal("on").nullable(),
  // Pull the first value out explicitly to ensure proper type inference.
  // For more details, refer to: https://stackoverflow.com/a/73825370/14769333
  expirationTime: z.enum(["", ...EXPIRATION_TIMES_IN_MINUTES]),
  password: z.string().min(4, "The password needs at least four characters."),
});

export type FlattenedErrors = z.inferFlattenedErrors<typeof schema>;

export async function loader() {
  const messageCount = getMessageCount("all");
  return { messageCount };
}

export async function action({ request }: Route.ActionArgs) {
  // return data({ formErrors: {
  //   das: "das",
  // }, uuidError: null });
  const formData = await request.formData();
  const message = formData.get("message");
  const oneTimeMessage = formData.get("one-time-message");
  const expirationTime = formData.get("expiration-time");
  const password = formData.get("password");

  const { error, data: parsedData } = schema.safeParse({
    message,
    oneTimeMessage,
    expirationTime,
    password,
  });

  if (error) {
    return data(
      { formErrors: error.flatten(), uuidError: null },
      {
        status: 400,
      },
    );
  }
  const isOneTimeMessage = parsedData.oneTimeMessage === "on";
  const isExpiringMessage = parsedData.expirationTime !== "";
  const isStandardMessage = !isOneTimeMessage && !isExpiringMessage;
  try {
    // data({ formErrors: null, uuidError: null });
    const { uuid } = await createMessage(
      parsedData.message,
      isOneTimeMessage,
      isExpiringMessage ? parseInt(parsedData.expirationTime) : null,
      parsedData.password,
    );
    await Promise.all([
      isOneTimeMessage && incrementMessageCount("oneTime"),
      isExpiringMessage && incrementMessageCount("expiring"),
      isStandardMessage && incrementMessageCount("standard"),
      incrementMessageCount("all"),
    ]);
    throw redirect(`/${uuid}`);
  } catch (error) {
    // Handle unique constraint error
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return data(
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
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const { messageCount } = loaderData;
  const formErrors = actionData?.formErrors;
  const uuidError = actionData?.uuidError;
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const messageCounterRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline();
      timeline
        .to(headingRef.current, {
          scale: 1,
          autoAlpha: 1,
        })
        .fromTo(
          headingRef.current,
          {
            y: 200,
            ease: "power4.inOut",
          },
          {
            duration: 1.5,
            y: 0,
          },
          "-=0.25",
        )
        .fromTo(
          descriptionRef.current,
          { y: 48, ease: "power4.inOut" },
          {
            autoAlpha: 1,
            y: 0,
          },
          "-=0.5",
        )
        .to(messageCounterRef.current, {
          scale: 1,
          ease: "elastic.out(0.8,0.3)",
        })
        .fromTo(
          formRef.current,
          {
            y: 64,
          },
          {
            autoAlpha: 1,
            y: 0,
          },
          "-=0.5",
        )
        .add(function generateCypherTimeline() {
          const cypherTimeline = gsap.timeline();
          cypherTimeline
            .to(headingRef.current, {
              duration: 2,
              text: {
                value: "****** ********",
                newClass: "text-neutral-400",
              },
              yoyo: true,
              repeat: 1,
              repeatDelay: 1,
              ease: "none",
            })
            .to(descriptionRef.current, {
              delay: 1,
              duration: 8,
              text: {
                value: description,
                newClass: "text-black/10",
              },
              yoyo: true,
              repeat: 1,
              repeatDelay: 1,
              ease: "none",
            })
            .repeat(-1)
            .repeatDelay(2);
        }, "+=0.5");
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="container flex h-full flex-col items-center justify-center
        space-y-12 px-4 text-center md:space-y-16 md:px-6"
    >
      <div>
        <GradientHeading
          ref={headingRef}
          className="scale-50 text-4xl/snug opacity-0 md:text-5xl/snug
            lg:text-6xl/snug"
        >
          Secret Messages
        </GradientHeading>
        <p
          ref={descriptionRef}
          className="invisible mx-auto max-w-screen-sm text-neutral-700
            dark:text-neutral-400 md:text-xl"
        >
          {description}
        </p>
        <GradientContainer
          className="mt-4 inline-flex scale-0"
          rotate
          ref={messageCounterRef}
        >
          <div className="rounded-md bg-white/40 backdrop-blur-md">
            <p
              className="rounded-md bg-gradient-to-br from-rose-500 via-sky-500
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
      <div className="w-full max-w-md opacity-0" ref={formRef}>
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
            className="max-w-screen-sm text-neutral-600 dark:text-neutral-400
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
          {useMemo(
            () =>
              FEATURES.map(({ icon: Icon, title, description }, index) => {
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
              }),
            [FEATURES],
          )}
        </div>
      </section>
    </div>
  );
}
