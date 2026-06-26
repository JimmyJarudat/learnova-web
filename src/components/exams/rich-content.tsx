import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type RichContentProps = {
  content: string | null | undefined;
  format?: string | null;
  className?: string;
};

export function RichContent({ content, format = "MARKDOWN", className }: RichContentProps) {
  if (!content) {
    return null;
  }

  if (format === "PLAIN_TEXT") {
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="my-2 leading-8">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => <strong className="font-black">{children}</strong>,
          img: ({ alt, src }) => {
            if (!src) {
              return null;
            }

            return (
              <img
                src={src}
                alt={alt ?? ""}
                className="my-4 max-h-[420px] w-auto max-w-full rounded-lg border border-slate-200 bg-white object-contain"
              />
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
