import { useFetcher } from "react-router";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
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
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { action, messageSchema } from "@/routes/home";

const MINIMUM_MESSAGE_LENGTH = 2;
const MAXIMUM_MESSAGE_LENGTH = 500;

export default function EncryptForm() {
  const { Form, state, data } = useFetcher<typeof action>();
  const [charCount, setCharCount] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [form, fields] = useForm({
    // This not only syncs the error from the server
    // But is also used as the default value of the form
    // in case the document is reloaded for progressive enhancement
    lastResult: data,
    // Validate field once user leaves the field
    shouldValidate: "onBlur",
    // Then, revalidate field as user types again
    shouldRevalidate: "onInput",
    // Run the same validation logic on client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: messageSchema });
    },
    // To derive all validation attributes
    constraint: getZodConstraint(messageSchema),
    id: "encrypt-form",
  });
  const isLoading = state !== "idle";

  return (
    <Form
      method="post"
      action="?index"
      className="flex flex-col gap-4 rounded-lg bg-white/50 p-4 text-left
        shadow-lg ring-2 shadow-sky-700/20 ring-neutral-50 backdrop-blur-md"
      {...getFormProps(form)}
    >
      <div className="space-y-2">
        <div
          className={cn(
            "flex items-end gap-1",
            charCount > 0 && "justify-between",
          )}
        >
          <Label className="block leading-tight" htmlFor={fields.message.id}>
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
        {fields.message.errors && fields.message.errors.length > 0 && (
          <ErrorOutput message={fields.message.errors.join("")} />
        )}
        <Textarea
          className="min-h-24"
          placeholder="Type your secret message here..."
          minLength={MINIMUM_MESSAGE_LENGTH}
          maxLength={MAXIMUM_MESSAGE_LENGTH}
          onChange={(e) => setCharCount(e.target.value.length)}
          {...getInputProps(fields.message, {
            type: "text",
          })}
        />
      </div>
      <div>
        <Label className="flex flex-col items-stretch gap-2">
          Expiration Time
          <div className="flex gap-2">
            {/* https://github.com/radix-ui/themes/issues/234 */}
            <input
              {...getInputProps(fields.expirationTime, {
                type: "hidden",
              })}
            />
            <Select
              {...getSelectProps(fields.expirationTime)}
              onValueChange={(e) => setValue(e)}
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
          {...getInputProps(fields.oneTimeMessage, {
            type: "checkbox",
          })}
        />
        <div className="grid gap-0.5 leading-none">
          <Label
            htmlFor={fields.oneTimeMessage.id}
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
            ref={passwordRef}
            placeholder="Enter a password to protect your message"
            className="pr-9"
            autoComplete="one-time-code"
            {...getInputProps(fields.password, {
              type: "password",
            })}
          />
          <PasswordVisibilityButton passwordRef={passwordRef} />
        </div>
      </div>
      {/* {passwordErrors &&
        passwordErrors.map((error, index) => (
          <ErrorOutput key={index} message={error} />
        ))} */}
      <Button disabled={isLoading} type="submit" size="sm">
        {isLoading ? (
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
