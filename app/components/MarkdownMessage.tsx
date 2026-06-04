import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders decrypted message content as Markdown. react-markdown does not render
// raw HTML by default, so user content stays XSS-safe.
export default function MarkdownMessage({ children }: { children: string }) {
  return (
    <div
      className="leading-relaxed break-words text-neutral-800
        [&>*+*]:mt-3 [&>*:first-child]:mt-0
        [&_a]:font-medium [&_a]:text-sky-700 [&_a]:underline
        [&_a]:decoration-sky-700/30 [&_a]:underline-offset-2
        hover:[&_a]:decoration-sky-700
        [&_blockquote]:border-l-2 [&_blockquote]:border-sky-300
        [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground
        [&_blockquote]:italic
        [&_code]:rounded [&_code]:bg-sky-500/10 [&_code]:px-1.5 [&_code]:py-0.5
        [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-sky-900
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:tracking-tight
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight
        [&_h3]:font-bold
        [&_hr]:border-black/10
        [&_img]:rounded-lg
        [&_li]:my-1 [&_li_p]:my-0
        [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5
        [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
        [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-900
        [&_pre]:p-3 [&_pre]:text-sm
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-neutral-100
        [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto
        [&_td]:border [&_td]:border-black/10 [&_td]:px-2 [&_td]:py-1
        [&_th]:border [&_th]:border-black/10 [&_th]:bg-black/5 [&_th]:px-2
        [&_th]:py-1 [&_th]:text-left"
    >
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  );
}
