import { Form, useNavigation } from "@remix-run/react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import PasswordInput from "./PasswordInput";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { LinkSimple } from "@phosphor-icons/react/dist/ssr/LinkSimple";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";

export default function EncryptForm() {
  const { state } = useNavigation();

  return (
    <>
      <Form
        id="form"
        method="post"
        className="flex flex-col gap-4 rounded-lg bg-white/30 p-4 shadow-md
          ring-2 ring-white/70 backdrop-blur-md"
      >
        <div className="space-y-2">
          <Label className="block text-left" htmlFor="message">
            Your Message{" "}
            <span className="text-xs text-muted-foreground">
              (max 500 characters)
            </span>
          </Label>
          <Textarea
            className="min-h-[120px]"
            id="message"
            name="message"
            placeholder="Type your secret message here..."
          />
        </div>
        <PasswordInput />
      </Form>

    </>
  );
}
