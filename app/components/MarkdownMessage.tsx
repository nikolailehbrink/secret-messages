import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders decrypted message content as Markdown. react-markdown does not render
// raw HTML by default, so user content stays XSS-safe.
export default function MarkdownMessage({ children }: { children: string }) {
  return (
    <div
      className="space-y-3 leading-relaxed break-words [&_a]:font-medium
        [&_a]:text-sky-700 [&_a]:underline [&_blockquote]:border-l-2
        [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3
        [&_blockquote]:text-muted-foreground [&_code]:rounded
        [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm
        [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold
        [&_h3]:font-bold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5
        [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black/5
        [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_ul]:list-disc [&_ul]:pl-5"
    >
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  );
}
