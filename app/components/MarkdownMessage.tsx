import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders decrypted message content as Markdown. react-markdown does not render
// raw HTML by default, so user content stays XSS-safe.
export default function MarkdownMessage({ children }: { children: string }) {
  return (
    <div
      className="prose prose-sm prose-neutral max-w-none break-words
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-h1:text-base prose-h2:text-sm prose-h3:text-sm prose-h4:text-sm
        prose-a:font-medium prose-a:text-sky-700 prose-a:decoration-sky-700/30
        prose-a:underline-offset-2 hover:prose-a:decoration-sky-700
        prose-blockquote:border-sky-300 prose-blockquote:font-normal
        prose-blockquote:text-muted-foreground prose-blockquote:not-italic
        prose-code:rounded prose-code:bg-sky-500/10 prose-code:px-1.5
        prose-code:py-0.5 prose-code:font-medium prose-code:text-sky-900
        prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-neutral-900 prose-pre:text-neutral-100
        prose-img:rounded-lg
        prose-th:bg-black/5"
    >
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  );
}
