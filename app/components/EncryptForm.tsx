import { Form, useNavigation } from "@remix-run/react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import PasswordInput from "./PasswordInput";
import {
  CircleNotch,
  LinkSimple,
  LockKey,
} from "@phosphor-icons/react/dist/ssr";

export default function EncryptForm() {
  const { state } = useNavigation();

  return (
    <>
      <Form id="form" method="post" className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label className="block text-left" htmlFor="message">
            Your Message{" "}
            <span className="text-xs text-muted-foreground">
              (max 500 characters)
            </span>
          </Label>
          <Textarea
            className="min-h-[100px]"
            id="message"
            name="message"
            placeholder="Type your secret message here..."
          />
        </div>
        <PasswordInput />
        <Button
          disabled={state === "submitting"}
          className="w-full gap-1"
          type="button"
          id="openDialog"
        >
          <LockKey size={20} weight="duotone" />
          Encrypt message
        </Button>
        <noscript>
          <style>
            {`
                #openDialog {
                display: none;
                }
            `}
          </style>
          <Button
            disabled={state === "submitting"}
            className="w-full gap-1"
            type="submit"
          >
            <LinkSimple size={20} weight="duotone" />
            Generate Link
          </Button>
        </noscript>
        <dialog
          id="dialog"
          className="rounded-lg border-2 border-neutral-300 text-left
            backdrop:bg-black/30"
        >
          <div className="flex flex-col gap-4 p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                Confirm
              </h2>

              <p className="text-sm text-muted-foreground">
                Do you really want to encrypt the message?
              </p>
            </div>
            <div
              className="flex flex-col gap-2 sm:flex-row sm:justify-end
                sm:space-x-2"
            >
              <Button
                disabled={state === "submitting"}
                id="closeDialog"
                type="button"
                variant={"outline"}
                size={"sm"}
              >
                Cancel
              </Button>
              <Button disabled={state === "submitting"} type="submit" size="sm">
                {state === "submitting" ? (
                  <>
                    <CircleNotch className="animate-spin" size={20} />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <LinkSimple size={20} weight="duotone" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </dialog>
      </Form>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('form');
            const dialog = form.querySelector('#dialog');
            const openDialogButton = form.querySelector('#openDialog');
            const closeDialogButton = form.querySelector('#closeDialog');
            const submitButton = form.querySelector('button[type="submit"]');
            openDialogButton.addEventListener('click', () => {
              dialog.showModal();
            });
            closeDialogButton.addEventListener('click', () => {
              console.log("close dialog")
              dialog.close();
            });
            submitButton.addEventListener('click', () => {
              dialog.close();
            });
          });
        `,
        }}
      />
    </>
  );
}
