import { Form, useNavigation } from "@remix-run/react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import PasswordInput from "./PasswordInput";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FlattenedErrors } from "@/routes/_index";
import ErrorOutput from "@/components/ErrorOutput";

export default function EncryptForm({ errors }: { errors?: FlattenedErrors }) {
  const { state } = useNavigation();
  const [charCount, setCharCount] = useState(0);
  const passwordErrors = errors?.fieldErrors.password;
  const messageErrors = errors?.fieldErrors.message;

  return (
    <Form
      id="form"
      method="post"
      className="flex flex-col gap-4 rounded-lg bg-white/40 p-4 shadow-md ring-2
        ring-neutral-50 backdrop-blur-md"
    >
      <div className="space-y-2">
        <div
          className={cn(
            "flex items-end gap-1",
            charCount > 0 && "justify-between",
          )}
        >
          <Label className="block text-left leading-tight" htmlFor="message">
            Your Message{" "}
          </Label>
          {charCount > 0 ? (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                charCount > 500 && "text-red-500",
              )}
            >
              {charCount}/500
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              (max 500 characters)
            </span>
          )}
        </div>
        <Textarea
          className="min-h-[120px] "
          id="message"
          name="message"
          placeholder="Type your secret message here..."
          // minLength={2}
          onChange={(e) => setCharCount(e.target.value.length)}
        />
      </div>
      {messageErrors &&
        messageErrors.map((error, index) => (
          <ErrorOutput key={index} message={error} />
        ))}
      <PasswordInput />
      {passwordErrors &&
        passwordErrors.map((error, index) => (
          <ErrorOutput key={index} message={error} />
        ))}
      <Button disabled={state === "submitting"} type="submit" size="sm">
        {state === "submitting" ? (
          <>
            <CircleNotch className="animate-spin" size={20} />
            Generating Link...
          </>
        ) : (
          <>
            <LockKey size={20} weight="duotone" />
            Encrypt message
          </>
        )}
      </Button>
    </Form>
  );
}