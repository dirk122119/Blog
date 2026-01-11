"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  href?: string;
}

export function Button({
  className = "",
  variant = "primary",
  size = "default",
  href,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  const variants = {
    primary: "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-button hover:shadow-button hover:-translate-y-0.5",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5",
    outline: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300",
    secondary: "bg-indigo-50 text-indigo-700 shadow-sm hover:bg-indigo-100 hover:-translate-y-0.5 dark:bg-indigo-950/50 dark:text-indigo-300",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  };

  const sizes = {
    default: "h-11 px-6",
    sm: "h-9 rounded-md px-4 text-xs",
    lg: "h-14 rounded-xl px-10 text-base",
    icon: "h-11 w-11",
  };

  const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
