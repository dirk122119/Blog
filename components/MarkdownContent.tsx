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
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-16 mb-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-6 border-b border-slate-200 pb-3 dark:border-slate-800" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-10 mb-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium my-6" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-6 ml-6 list-disc space-y-3 text-slate-600 dark:text-slate-400 font-medium" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-6 ml-6 list-decimal space-y-3 text-slate-600 dark:text-slate-400 font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-10 border-l-4 border-indigo-500 bg-indigo-50/50 p-8 rounded-r-xl italic text-xl text-slate-700 dark:bg-indigo-950/20 dark:text-slate-300 font-medium" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="relative rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-bold text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                {...props}
              >
                {children}
              </code>
            ) : (
              <pre className="my-10 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                <code className={cn(className, "text-sm leading-relaxed")} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          a: ({ node, ...props }) => (
            <a
              className="font-bold text-indigo-600 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-500 transition-all dark:text-indigo-400 dark:decoration-indigo-900 dark:hover:decoration-indigo-400"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-20 border-slate-200 dark:border-slate-800" {...props} />
          ),
          img: ({ node, ...props }) => (
            <div className="my-12">
              <img className="rounded-2xl border border-slate-200 shadow-xl dark:border-slate-800 w-full object-cover" {...props} alt={props.alt || ''} />
              {props.alt && <span className="block mt-4 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">{props.alt}</span>}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Helper needed inside the component
import { cn } from "@/lib/utils";
