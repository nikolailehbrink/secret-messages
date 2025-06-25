import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";

import { useEffect, useState } from "react";

type Props = { passwordRef: React.RefObject<HTMLInputElement | null> };

export default function PasswordVisibilityButton({ passwordRef }: Props) {
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    if (!passwordRef) return;
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
      className="absolute right-1 bottom-1 size-8"
      size="icon"
      variant="ghost"
      type="button"
      onClick={() => setPasswordVisibility(!passwordVisibility)}
    >
      {passwordVisibility ? (
        <EyeSlashIcon size={20} weight="duotone" />
      ) : (
        <EyeIcon size={20} weight="duotone" />
      )}
      <span className="sr-only">Toggle password visibility</span>
    </Button>
  );
}
