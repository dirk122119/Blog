"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        // 自訂樣式
        h1: ({ node, ...props }) => (
          <h1 className="mb-4 mt-8 text-3xl font-bold" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="mb-3 mt-6 text-2xl font-semibold" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="mb-2 mt-4 text-xl font-semibold" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-4 leading-7" {...props} />
        ),
        code: ({ node, className, children, ...props }: any) => {
          const isInline = !className;
          return isInline ? (
            <code
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ node, ...props }) => (
          <pre
            className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4"
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="mb-4 ml-6 list-disc" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="mb-4 ml-6 list-decimal" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="mb-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

