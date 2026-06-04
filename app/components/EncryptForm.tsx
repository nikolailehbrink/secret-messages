import { useFetcher, useNavigate } from "react-router";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
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
import { encryptText, encryptWithGeneratedKey } from "@/lib/crypto";

const MINIMUM_MESSAGE_LENGTH = 2;
const MAXIMUM_MESSAGE_LENGTH = 5000;
const MINIMUM_PASSWORD_LENGTH = 4;

type ClientErrors = {
  message?: string;
  password?: string;
  encryption?: string;
};

type ActionData = {
  uuid: string | null;
  uuidError: string | null;
  formErrors: unknown;
};

export default function EncryptForm() {
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();
  const [charCount, setCharCount] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [expirationTime, setExpirationTime] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(true);
  const [errors, setErrors] = useState<ClientErrors>({});
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Holds the random key for a passwordless message until the redirect; it is
  // appended to the link as a URL fragment and must never reach the server.
  const fragmentKeyRef = useRef<string | null>(null);
  const navigatedRef = useRef(false);

  const isBusy = isEncrypting || fetcher.state !== "idle";
  const serverError =
    fetcher.data?.uuidError ??
    (fetcher.data?.formErrors
      ? "Something went wrong. Please try again."
      : null);

  // On a successful create the action returns the uuid (instead of redirecting)
  // so we can attach the fragment key client-side for passwordless messages.
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.uuid &&
      !navigatedRef.current
    ) {
      navigatedRef.current = true;
      const key = fragmentKeyRef.current;
      navigate(`/${fetcher.data.uuid}${key ? `#${key}` : ""}`);
    }
  }, [fetcher.state, fetcher.data, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // The message is encrypted in the browser; only the resulting ciphertext is
    // submitted, so the plaintext, password and key never reach the server.
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
    if (passwordProtected && password.length < MINIMUM_PASSWORD_LENGTH) {
      nextErrors.password = `The password needs at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    try {
      setIsEncrypting(true);
      const payload = new FormData();

      if (passwordProtected) {
        const { encryptedMessage, iv, salt } = await encryptText(
          message,
          password,
        );
        payload.set("encrypted-content", encryptedMessage);
        payload.set("iv", iv);
        payload.set("salt", salt);
        fragmentKeyRef.current = null;
      } else {
        const { encryptedMessage, iv, key } =
          await encryptWithGeneratedKey(message);
        payload.set("encrypted-content", encryptedMessage);
        payload.set("iv", iv);
        fragmentKeyRef.current = key;
      }

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
      <div className="items-top flex space-x-1.5">
        <Checkbox
          aria-label="Protect this message with a password"
          id="password-protected"
          checked={passwordProtected}
          onCheckedChange={(checked) => setPasswordProtected(checked === true)}
        />
        <div className="grid gap-0.5 leading-none">
          <Label htmlFor="password-protected">Protect with a password</Label>
          <p className="text-xs text-muted-foreground">
            {passwordProtected
              ? "The recipient needs the password to open the message."
              : "Anyone with the link can read it — the key is part of the link itself."}
          </p>
        </div>
      </div>
      {passwordProtected && (
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
      )}
      {errors.encryption && <ErrorOutput message={errors.encryption} />}
      {serverError && <ErrorOutput message={serverError} />}
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
