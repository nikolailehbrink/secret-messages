import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";

export default function PasswordInput({
  placeholderText = "Enter a password to protect your message",
}: {
  placeholderText?: string;
}) {
  const passwordRef = useRef<HTMLInputElement>(null!);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    if (passwordVisibility) {
      passwordRef.current.type = "text";
    } else {
      passwordRef.current.type = "password";
    }
  }, [passwordVisibility]);

  return (
    <div className="relative space-y-2">
      <Label className="block text-left" htmlFor="password">
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          ref={passwordRef}
          placeholder={placeholderText}
          type="password"
          name="password"
          className="pr-9"
        />

        <Button
          className="absolute bottom-1 right-1 size-8"
          size="icon"
          variant="ghost"
          type="button"
          onClick={() => setPasswordVisibility(!passwordVisibility)}
        >
          {passwordVisibility ? (
            <EyeSlash size={20} weight="duotone" />
          ) : (
            <Eye size={20} weight="duotone" />
          )}
          <span className="sr-only">Toggle password visibility</span>
        </Button>
      </div>
    </div>
  );
}
