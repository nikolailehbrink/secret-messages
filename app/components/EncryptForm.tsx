import { Form, useNavigation } from "@remix-run/react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FlattenedErrors } from "@/routes/_index";
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

export default function EncryptForm({
  errors,
}: {
  errors?: FlattenedErrors | null;
}) {
  const { state } = useNavigation();
  const [charCount, setCharCount] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null!);
  const [value, setValue] = useState("");

  const passwordErrors = errors?.fieldErrors.password;
  const messageErrors = errors?.fieldErrors.message;

  return (
    <Form
      id="form"
      method="post"
      className="flex flex-col gap-4 rounded-lg bg-white/40 p-4 text-left
        shadow-md ring-2 ring-neutral-50 backdrop-blur-md"
    >
      <div className="space-y-2">
        <div
          className={cn(
            "flex items-end gap-1",
            charCount > 0 && "justify-between",
          )}
        >
          <Label className="block leading-tight" htmlFor="message">
            Your Message{" "}
          </Label>
          {charCount > 0 ? (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                charCount > 500 || (charCount < 2 && "text-red-500"),
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
        {messageErrors &&
          messageErrors.map((error, index) => (
            <ErrorOutput key={index} message={error} />
          ))}
        <Textarea
          className="min-h-[120px] "
          id="message"
          name="message"
          placeholder="Type your secret message here..."
          minLength={2}
          maxLength={500}
          onChange={(e) => setCharCount(e.target.value.length)}
        />
      </div>
      <div>
        <Label className="flex flex-col gap-2">
          Expiration Time
          <div className="flex gap-2">
            {/* https://github.com/radix-ui/themes/issues/234 */}
            <input type="hidden" name="expiration-time" value={value} />
            <Select value={value} onValueChange={(e) => setValue(e)}>
              <SelectTrigger>
                <SelectValue placeholder="Never" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Min.</SelectItem>
                <SelectItem value="15">15 Min.</SelectItem>
                <SelectItem value="60">1 Hour</SelectItem>
                <SelectItem value="720">12 Hours</SelectItem>
                <SelectItem value="4320">3 Days</SelectItem>
                <SelectItem value="10080">7 Days</SelectItem>
                <SelectItem value="40320">28 days</SelectItem>
              </SelectContent>
            </Select>
            {value !== "" && (
              <Button
                aria-label="Reset lifetime"
                type="button"
                className="shrink-0"
                size={"icon"}
                onClick={() => setValue("")}
              >
                <ArrowCounterClockwise size={20} weight="duotone" />
              </Button>
            )}
          </div>
        </Label>
      </div>
      <div className="items-top flex space-x-1.5">
        <Checkbox id="one-time-message" name="one-time-message" />
        <div className="grid gap-0.5 leading-none">
          <Label
            htmlFor="one-time-message"
            className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            One Time Message
          </Label>
          <p className="text-sm text-muted-foreground">
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
            placeholder={"Enter a password to protect your message"}
            type="password"
            name="password"
            className="pr-9"
            autoComplete="off"
            minLength={4}
            required
          />
          <PasswordVisibilityButton passwordRef={passwordRef} />
        </div>
      </div>

      {/* <PasswordInput /> */}
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
