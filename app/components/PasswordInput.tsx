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
  return (
    <>
      <div className="relative space-y-2">
        <Label className="block text-left" htmlFor="password">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            placeholder={placeholderText}
            type="password"
            name="password"
            className="pr-9"
          />

          <Button
            id="togglePasswordVisibility"
            className="absolute bottom-1 right-1 size-8"
            size="icon"
            variant="ghost"
            type="button"
          >
            <Eye id="showPassword" size={20} weight="duotone" />
            <EyeSlash
              id="hidePassword"
              className="hidden"
              size={20}
              weight="duotone"
            />
            <span className="sr-only">Toggle password visibility</span>
          </Button>
        </div>
      </div>
    </>
  );
}
