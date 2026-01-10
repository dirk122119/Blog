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
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-12 mb-6" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted/50 p-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          a: ({ node, ...props }) => (
            <a
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-12 border-border" {...props} />
          ),
          img: ({ node, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="rounded-md border border-border my-8 w-full object-cover shadow-sm" {...props} alt={props.alt || ''} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
