import { useFetcher } from "react-router";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
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
import { encryptText } from "@/lib/crypto";

const MINIMUM_MESSAGE_LENGTH = 2;
const MAXIMUM_MESSAGE_LENGTH = 5000;
const MINIMUM_PASSWORD_LENGTH = 4;

type ClientErrors = {
  message?: string;
  password?: string;
  encryption?: string;
};

export default function EncryptForm() {
  const fetcher = useFetcher();
  const [charCount, setCharCount] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [expirationTime, setExpirationTime] = useState("");
  const [errors, setErrors] = useState<ClientErrors>({});
  const [isEncrypting, setIsEncrypting] = useState(false);

  const isBusy = isEncrypting || fetcher.state !== "idle";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // The message is encrypted in the browser; only the resulting ciphertext is
    // submitted, so the plaintext and password never reach the server.
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") ?? "");
    const password = String(formData.get("password") ?? "");

    const nextErrors: ClientErrors = {};
    if (message.length < MINIMUM_MESSAGE_LENGTH) {
      nextErrors.message = `The message needs at least ${MINIMUM_MESSAGE_LENGTH} characters.`;
    } else if (message.length > MAXIMUM_MESSAGE_LENGTH) {
      nextErrors.message = `The message can't be longer than ${MAXIMUM_MESSAGE_LENGTH} characters.`;
    }
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      nextErrors.password = `The password needs at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    try {
      setIsEncrypting(true);
      const { encryptedMessage, iv, salt } = await encryptText(
        message,
        password,
      );

      const payload = new FormData();
      payload.set("encrypted-content", encryptedMessage);
      payload.set("iv", iv);
      payload.set("salt", salt);
      payload.set("expiration-time", expirationTime);
      if (formData.get("one-time-message")) {
        payload.set("one-time-message", "on");
      }

      fetcher.submit(payload, { method: "post", action: "?index" });
    } catch (error) {
      console.error(error);
      setErrors({ encryption: "Encryption failed. Please try again." });
    } finally {
      setIsEncrypting(false);
    }
  }

  return (
    <fetcher.Form
      id="form"
      method="post"
      action="?index"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg bg-white/50 p-4 text-left
        shadow-lg ring-2 shadow-sky-700/20 ring-neutral-50 backdrop-blur-md"
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
        {errors.message && <ErrorOutput message={errors.message} />}
        <Textarea
          className="min-h-32"
          id="message"
          name="message"
          placeholder="Type your secret message here..."
          minLength={MINIMUM_MESSAGE_LENGTH}
          maxLength={MAXIMUM_MESSAGE_LENGTH}
          onChange={(e) => setCharCount(e.target.value.length)}
        />
        <p className="text-xs text-muted-foreground">
          Supports Markdown — <code>**bold**</code>, <code>_italic_</code>,
          lists, <code>[links](url)</code> and <code>`code`</code>.
        </p>
      </div>
      <div>
        <Label className="flex flex-col items-stretch gap-2">
          Expiration Time
          <div className="flex gap-2">
            <Select
              value={expirationTime}
              onValueChange={(value) => setExpirationTime(value)}
            >
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
            {expirationTime !== "" && (
              <Button
                aria-label="Reset lifetime"
                type="button"
                className="shrink-0"
                size="icon"
                onClick={() => setExpirationTime("")}
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
            minLength={MINIMUM_PASSWORD_LENGTH}
            required
          />
          <PasswordVisibilityButton passwordRef={passwordRef} />
        </div>
        {errors.password && <ErrorOutput message={errors.password} />}
      </div>
      {errors.encryption && <ErrorOutput message={errors.encryption} />}
      <Button disabled={isBusy} type="submit" size="sm">
        {isBusy ? (
          <>
            <CircleNotchIcon className="animate-spin" size={20} />
            {isEncrypting ? "Encrypting..." : "Generating Link..."}
          </>
        ) : (
          <>
            <LockKeyIcon size={20} weight="duotone" />
            Encrypt message
          </>
        )}
      </Button>
    </fetcher.Form>
  );
}
