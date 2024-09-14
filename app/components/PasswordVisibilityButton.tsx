import { Button } from "./ui/button";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { useEffect, useState } from "react";

type Props = { passwordRef: React.RefObject<HTMLInputElement> };

export default function PasswordVisibilityButton({ passwordRef }: Props) {
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    if (passwordRef.current) {
      if (passwordVisibility) {
        passwordRef.current.type = "text";
      } else {
        passwordRef.current.type = "password";
      }
    }
  }, [passwordVisibility, passwordRef]);
  return (
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
  );
}
