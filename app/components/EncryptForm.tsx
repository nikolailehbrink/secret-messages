import { useFetcher } from "react-router";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { FlattenedErrors } from "@/routes/index";
import ErrorOutput from "@/components/ErrorOutput";
import { Input } from "./ui/input";
import PasswordVisibilityButton from "./PasswordVisibilityButton";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { EXPIRATION_TIMES } from "@/constants/expiration-times";
import {
  BackspaceIcon,
  CircleNotchIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";

const MINIMUM_MESSAGE_LENGTH = 2;
const MAXIMUM_MESSAGE_LENGTH = 500;

type Props = {
  errors?: FlattenedErrors | null;
};

export default function EncryptForm({ errors }: Props) {
  const { Form, state } = useFetcher();
  const [charCount, setCharCount] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  const passwordErrors = errors?.fieldErrors.password;
  const messageErrors = errors?.fieldErrors.message;

  return (
    <Form
      id="form"
      method="post"
      action="?index"
      className="flex flex-col gap-4 rounded-lg bg-white/50 p-4 text-left
        shadow-lg ring-2 ring-neutral-50 backdrop-blur-md"
    >
      <div className="space-y-2">
        <div
          className={cn(
            "flex items-end gap-1",
            charCount > 0 && "justify-between",
          )}
        >
          <Label className="block leading-tight" htmlFor="message">
            Your Message
          </Label>
          {charCount > 0 ? (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                (charCount > MAXIMUM_MESSAGE_LENGTH ||
                  charCount < MINIMUM_MESSAGE_LENGTH) &&
                  "text-red-500",
              )}
            >
              {charCount}/{MAXIMUM_MESSAGE_LENGTH}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              (max. {MAXIMUM_MESSAGE_LENGTH} characters)
            </span>
          )}
        </div>
        {messageErrors &&
          messageErrors.map((error, index) => (
            <ErrorOutput key={index} message={error} />
          ))}
        <Textarea
          className="min-h-[120px]"
          id="message"
          name="message"
          placeholder="Type your secret message here..."
          minLength={MINIMUM_MESSAGE_LENGTH}
          maxLength={MAXIMUM_MESSAGE_LENGTH}
          onChange={(e) => setCharCount(e.target.value.length)}
        />
      </div>
      <div>
        <Label className="flex flex-col items-stretch gap-2">
          Expiration Time
          <div className="flex gap-2">
            {/* https://github.com/radix-ui/themes/issues/234 */}
            <input type="hidden" name="expiration-time" value={value} />
            <Select value={value} onValueChange={(e) => setValue(e)}>
              <SelectTrigger
                className="w-full"
                aria-label="Select expiration time"
              >
                <SelectValue placeholder="Never" />
              </SelectTrigger>
              <SelectContent>
                {[...EXPIRATION_TIMES].map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value !== "" && (
              <Button
                aria-label="Reset lifetime"
                type="button"
                className="shrink-0"
                size="icon"
                onClick={() => setValue("")}
              >
                <BackspaceIcon size={20} weight="duotone" />
              </Button>
            )}
          </div>
        </Label>
      </div>
      <div className="items-top flex space-x-1.5">
        <Checkbox
          aria-label="Make this message a One-Time-Message"
          id="one-time-message"
          name="one-time-message"
        />
        <div className="grid gap-0.5 leading-none">
          <Label
            htmlFor="one-time-message"
            className="peer-disabled:cursor-not-allowed
              peer-disabled:opacity-70"
          >
            One Time Message
          </Label>
          <p className="text-xs text-muted-foreground">
            Once the message is viewed, it will be deleted.
          </p>
        </div>
      </div>
      <div className="relative space-y-2">
        <Label className="block" htmlFor="password">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            ref={passwordRef}
            placeholder="Enter a password to protect your message"
            type="password"
            name="password"
            className="pr-9"
            autoComplete="one-time-code"
            minLength={4}
            required
          />
          <PasswordVisibilityButton passwordRef={passwordRef} />
        </div>
      </div>
      {passwordErrors &&
        passwordErrors.map((error, index) => (
          <ErrorOutput key={index} message={error} />
        ))}
      <Button disabled={state !== "idle"} type="submit" size="sm">
        {state !== "idle" ? (
          <>
            <CircleNotchIcon className="animate-spin" size={20} />
            Generating Link...
          </>
        ) : (
          <>
            <LockKeyIcon size={20} weight="duotone" />
            Encrypt message
          </>
        )}
      </Button>
    </Form>
  );
}
