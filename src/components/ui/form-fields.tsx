import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-navy-700", className)} {...props}>
      {children}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border bg-white px-3.5 text-sm text-navy placeholder:text-navy-300 transition-colors",
          "focus:border-panoryx-blue focus:outline-none focus:ring-2 focus:ring-panoryx-blue/20",
          hasError ? "border-action-coral" : "border-navy-200",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy-300 transition-colors",
          "focus:border-panoryx-blue focus:outline-none focus:ring-2 focus:ring-panoryx-blue/20",
          hasError ? "border-action-coral" : "border-navy-200",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border bg-white px-3.5 text-sm text-navy transition-colors",
          "focus:border-panoryx-blue focus:outline-none focus:ring-2 focus:ring-panoryx-blue/20",
          hasError ? "border-action-coral" : "border-navy-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-action-coral" role="alert">
      {message}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-navy-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
